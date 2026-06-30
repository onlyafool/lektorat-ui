import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersonaEditor } from '@/features/persona-panel/PersonaEditor'
import { usePersonaStore } from '@/store/persona-store'
import { useSettingsStore } from '@/store/settings-store'

vi.mock('@/store/persona-store')
vi.mock('@/store/settings-store')

describe('PersonaEditor', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.mocked(usePersonaStore).mockReturnValue({
      addPersona: vi.fn().mockResolvedValue({ id: 'new-id' }),
      updatePersona: vi.fn(),
      deletePersona: vi.fn(),
    } as any)

    vi.mocked(useSettingsStore).mockReturnValue({
      providers: {
        ollama: { models: ['qwen2.5:7b', 'llama3.1:8b'] },
        anthropic: { models: ['claude-sonnet-4-20250514'] },
      },
    } as any)
  })

  it('shows create mode when no persona provided', () => {
    render(<PersonaEditor persona={null} onClose={mockOnClose} />)
    
    expect(screen.getByText('Neue Persona erstellen')).toBeInTheDocument()
  })

  it('shows edit mode when persona provided', () => {
    const persona = {
      id: 'test-id',
      name: 'Meine Persona',
      description: 'Test Beschreibung',
      systemPrompt: 'Du bist ein Test.',
      color: '#2563eb',
      icon: 'user',
      model: {
        provider: 'ollama' as const,
        modelId: 'qwen2.5:7b',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
        stop: [],
      },
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    render(<PersonaEditor persona={persona} onClose={mockOnClose} />)
    
    expect(screen.getByText('Persona bearbeiten')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Meine Persona')).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<PersonaEditor persona={null} onClose={mockOnClose} />)
    
    expect(screen.getByPlaceholderText('z.B. Mein Korrektor')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('z.B. Mein persönlicher Korrektor')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Du bist ein erfahrener Korrektor...')).toBeInTheDocument()
  })

  it('calls onClose when clicking cancel', () => {
    render(<PersonaEditor persona={null} onClose={mockOnClose} />)
    
    fireEvent.click(screen.getByText('Abbrechen'))
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows temperature slider', () => {
    render(<PersonaEditor persona={null} onClose={mockOnClose} />)
    
    expect(screen.getByText(/Temperature/)).toBeInTheDocument()
    expect(screen.getAllByRole('slider').length).toBeGreaterThanOrEqual(1)
  })

  it('shows provider select', () => {
    render(<PersonaEditor persona={null} onClose={mockOnClose} />)
    
    expect(screen.getByText('Ollama (lokal)')).toBeInTheDocument()
    expect(screen.getByText('Anthropic (Cloud)')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<PersonaEditor persona={null} onClose={mockOnClose} />)
    
    fireEvent.click(screen.getByText('Speichern'))
    
    expect(screen.getByText('Name ist erforderlich')).toBeInTheDocument()
    expect(screen.getByText('System Prompt ist erforderlich')).toBeInTheDocument()
  })

  it('shows delete button for custom personas', () => {
    const persona = {
      id: 'test-id',
      name: 'Custom',
      description: '',
      systemPrompt: 'Test',
      color: '#2563eb',
      icon: 'user',
      model: {
        provider: 'ollama' as const,
        modelId: 'qwen2.5:7b',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
        stop: [],
      },
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    render(<PersonaEditor persona={persona} onClose={mockOnClose} />)
    
    expect(screen.getByText('Löschen')).toBeInTheDocument()
  })

  it('hides delete button for built-in personas', () => {
    const persona = {
      id: 'test-id',
      name: 'Built-in',
      description: '',
      systemPrompt: 'Test',
      color: '#2563eb',
      icon: 'user',
      model: {
        provider: 'ollama' as const,
        modelId: 'qwen2.5:7b',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
        stop: [],
      },
      isBuiltIn: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    render(<PersonaEditor persona={persona} onClose={mockOnClose} />)
    
    expect(screen.queryByText('Löschen')).not.toBeInTheDocument()
  })
})
