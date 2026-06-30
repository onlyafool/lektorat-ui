-- ============================================
-- Lektorat UI - Datenbank-Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Profiles (User-Daten)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. Personas (KI-Personas)
-- ============================================
CREATE TABLE personas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model_provider TEXT NOT NULL DEFAULT 'ollama',
  model_id TEXT NOT NULL DEFAULT 'qwen2.5:7b',
  temperature REAL DEFAULT 0.3,
  max_tokens INTEGER DEFAULT 4096,
  top_p REAL DEFAULT 0.85,
  stop_sequences TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#2563eb',
  icon TEXT DEFAULT 'user',
  is_builtin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Manuscripts (Manuskripte)
-- ============================================
CREATE TABLE manuscripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  folder_path TEXT,
  file_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'chunked', 'processing', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Manuscript Files (Einzelne Dateien)
-- ============================================
CREATE TABLE manuscript_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Chunks (Aufgeteilte Texte)
-- ============================================
CREATE TABLE chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  file_id UUID REFERENCES manuscript_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chapter TEXT,
  position INTEGER NOT NULL,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Lektorat Results (Ergebnisse)
-- ============================================
CREATE TABLE lektorat_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error')),
  score REAL,
  summary TEXT,
  comments JSONB DEFAULT '[]',
  raw_output TEXT,
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Style Profiles (Stilprofile)
-- ============================================
CREATE TABLE style_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  avg_sentence_length REAL,
  filler_word_count INTEGER,
  top_words TEXT[],
  narrative_perspective TEXT,
  adjective_density REAL,
  unique_phrases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_personas_user_id ON personas(user_id);
CREATE INDEX idx_manuscripts_user_id ON manuscripts(user_id);
CREATE INDEX idx_manuscript_files_manuscript_id ON manuscript_files(manuscript_id);
CREATE INDEX idx_chunks_manuscript_id ON chunks(manuscript_id);
CREATE INDEX idx_chunks_file_id ON chunks(file_id);
CREATE INDEX idx_lektorat_results_manuscript_id ON lektorat_results(manuscript_id);
CREATE INDEX idx_lektorat_results_user_id ON lektorat_results(user_id);
CREATE INDEX idx_style_profiles_manuscript_id ON style_profiles(manuscript_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscript_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lektorat_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Personas: Users can CRUD their own personas + read built-in
CREATE POLICY "Users can view own personas" ON personas
  FOR SELECT USING (auth.uid() = user_id OR is_builtin = TRUE);

CREATE POLICY "Users can create personas" ON personas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personas" ON personas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personas" ON personas
  FOR DELETE USING (auth.uid() = user_id AND is_builtin = FALSE);

-- Manuscripts: Users can only CRUD their own
CREATE POLICY "Users can view own manuscripts" ON manuscripts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create manuscripts" ON manuscripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manuscripts" ON manuscripts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own manuscripts" ON manuscripts
  FOR DELETE USING (auth.uid() = user_id);

-- Manuscript Files: Users can only CRUD their own
CREATE POLICY "Users can view own files" ON manuscript_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create files" ON manuscript_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON manuscript_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON manuscript_files
  FOR DELETE USING (auth.uid() = user_id);

-- Chunks: Users can only CRUD their own
CREATE POLICY "Users can view own chunks" ON chunks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create chunks" ON chunks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chunks" ON chunks
  FOR DELETE USING (auth.uid() = user_id);

-- Lektorat Results: Users can only CRUD their own
CREATE POLICY "Users can view own results" ON lektorat_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create results" ON lektorat_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON lektorat_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own results" ON lektorat_results
  FOR DELETE USING (auth.uid() = user_id);

-- Style Profiles: Users can only CRUD their own
CREATE POLICY "Users can view own style profiles" ON style_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create style profiles" ON style_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own style profiles" ON style_profiles
  FOR DELETE USING (auth.uid() = user_id);
