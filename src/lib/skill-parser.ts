export interface ParsedSkill {
  name: string
  description: string
  systemPrompt: string
}

/**
 * Parst eine SKILL.md Datei mit YAML-Frontmatter.
 * Erwartet Format:
 *   ---
 *   name: skill-name
 *   description: Beschreibung
 *   ---
 *   System-Prompt Inhalt...
 */
export function parseSkillMd(content: string): ParsedSkill {
  const trimmed = content.trim()

  // YAML Frontmatter prüfen
  if (!trimmed.startsWith('---')) {
    return {
      name: 'Importierte Skill',
      description: '',
      systemPrompt: trimmed,
    }
  }

  const endFm = trimmed.indexOf('---', 3)
  if (endFm === -1) {
    return {
      name: 'Importierte Skill',
      description: '',
      systemPrompt: trimmed,
    }
  }

  const fmBlock = trimmed.slice(3, endFm).trim()
  const body = trimmed.slice(endFm + 3).trim()

  // Einfaches YAML-Parsing (nur key: value Paare)
  const fm: Record<string, string> = {}
  let currentKey = ''
  let currentValue = ''

  for (const line of fmBlock.split('\n')) {
    const match = line.match(/^(\w[\w-]*):\s*(.*)/)
    if (match) {
      if (currentKey) {
        fm[currentKey] = currentValue.trim()
      }
      currentKey = match[1]
      currentValue = match[2]
    } else {
      currentValue += ' ' + line.trim()
    }
  }
  if (currentKey) {
    fm[currentKey] = currentValue.trim()
  }

  return {
    name: fm.name || 'Importierte Skill',
    description: fm.description || '',
    systemPrompt: body,
  }
}

/**
 * Liest eine SKILL.md Datei via File Input
 */
export function readSkillFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    reader.readAsText(file)
  })
}
