import { describe, it, expect } from 'vitest'
import { parseSkillMd } from '@/lib/skill-parser'

describe('parseSkillMd', () => {
  it('parses SKILL.md with YAML frontmatter', () => {
    const content = `---
name: caveman
description: Ultra-compressed communication mode
---

Respond terse like smart caveman. All technical substance stay.`

    const result = parseSkillMd(content)

    expect(result.name).toBe('caveman')
    expect(result.description).toBe('Ultra-compressed communication mode')
    expect(result.systemPrompt).toBe('Respond terse like smart caveman. All technical substance stay.')
  })

  it('parses multiline description', () => {
    const content = `---
name: test-skill
description: >
  This is a long
  multiline description
---

Some system prompt content.`

    const result = parseSkillMd(content)

    expect(result.name).toBe('test-skill')
    expect(result.description).toContain('This is a long')
    expect(result.systemPrompt).toBe('Some system prompt content.')
  })

  it('handles missing frontmatter gracefully', () => {
    const content = `# Just a plain markdown file

This is the system prompt.`

    const result = parseSkillMd(content)

    expect(result.name).toBe('Importierte Skill')
    expect(result.description).toBe('')
    expect(result.systemPrompt).toContain('Just a plain markdown file')
  })

  it('handles incomplete frontmatter', () => {
    const content = `---
name: my-skill
---

Only name, no description.`

    const result = parseSkillMd(content)

    expect(result.name).toBe('my-skill')
    expect(result.description).toBe('')
    expect(result.systemPrompt).toBe('Only name, no description.')
  })

  it('handles empty frontmatter', () => {
    const content = `---
---

Content after empty frontmatter.`

    const result = parseSkillMd(content)

    expect(result.name).toBe('Importierte Skill')
    expect(result.systemPrompt).toBe('Content after empty frontmatter.')
  })

  it('extracts system prompt with markdown formatting', () => {
    const content = `---
name: formatted-skill
description: A skill with formatting
---

# Diagnose

A discipline for hard bugs.

## Phase 1

**This is the skill.** Everything else is mechanical.

1. Failing test
2. Curl script
3. CLI invocation`

    const result = parseSkillMd(content)

    expect(result.name).toBe('formatted-skill')
    expect(result.systemPrompt).toContain('# Diagnose')
    expect(result.systemPrompt).toContain('## Phase 1')
    expect(result.systemPrompt).toContain('1. Failing test')
  })

  it('handles description with colons', () => {
    const content = `---
name: complex
description: Use when: user says "debug this", reports a bug
---

Prompt content.`

    const result = parseSkillMd(content)

    expect(result.name).toBe('complex')
    expect(result.description).toBe('Use when: user says "debug this", reports a bug')
  })
})
