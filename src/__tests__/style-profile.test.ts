import { describe, it, expect } from 'vitest'
import { analyzeStyle } from '@/lib/style-profile'

const SAMPLE_TEXT = `Judith legte die Gabel hin. „Was hast du dir überlegt, das ich nicht mögen werde?"

Livia sah sie an. „Bitte sag mir nicht, du möchtest mich öffentlich mit irgendeinem kulturinteressierten Mann dekorieren."

„Es geht um das Benefiz am Samstag."

„Solange das noch ein Gerücht ist, haben wir das Tempo. Sobald jemand daraus eine Geschichte macht, haben wir es verloren."

Sascha korrigierte eine bereits korrigierte Position auf dem Tisch. Die Serviette lag jetzt exakt rechtwinklig zur Tischkante.

Livia nahm die Karte aus der Tasche. Legte sie auf den Tisch. Strich einmal mit dem Daumen über die Prägung, richtete sie aus.`

describe('analyzeStyle', () => {
  it('counts words and sentences', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.wordCount).toBeGreaterThan(50)
    expect(profile.sentenceCount).toBeGreaterThan(5)
  })

  it('calculates average sentence length', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.avgSentenceLength).toBeGreaterThan(5)
    expect(profile.avgSentenceLength).toBeLessThan(30)
  })

  it('detects narrative perspective', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(['ich', 'er', 'schauplatz', 'gemischt']).toContain(profile.narrativePerspective)
  })

  it('finds filler words', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(Array.isArray(profile.fillerWords)).toBe(true)
  })

  it('calculates adjective density', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.adjectiveDensity).toBeGreaterThanOrEqual(0)
    expect(profile.adjectiveDensity).toBeLessThan(50)
  })

  it('finds top words excluding stop words', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.topWords.length).toBeGreaterThan(0)
    // Stop words should not appear
    const stopWords = ['der', 'die', 'das', 'und', 'ist']
    for (const word of profile.topWords) {
      expect(stopWords).not.toContain(word.word)
    }
  })

  it('calculates unique word ratio', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.uniqueWordRatio).toBeGreaterThan(0)
    expect(profile.uniqueWordRatio).toBeLessThanOrEqual(1)
  })

  it('counts paragraphs', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.paragraphCount).toBeGreaterThan(0)
  })

  it('detects dialogue ratio', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.dialogueRatio).toBeGreaterThanOrEqual(0)
    expect(profile.dialogueRatio).toBeLessThanOrEqual(1)
  })

  it('calculates reading time', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.readingTimeMinutes).toBeGreaterThan(0)
  })

  it('calculates flesch reading ease', () => {
    const profile = analyzeStyle(SAMPLE_TEXT)

    expect(profile.fleschReadingEase).toBeGreaterThanOrEqual(0)
    expect(profile.fleschReadingEase).toBeLessThanOrEqual(100)
  })

  it('handles empty text', () => {
    const profile = analyzeStyle('')

    expect(profile.wordCount).toBe(0)
    expect(profile.sentenceCount).toBe(0)
    expect(profile.avgSentenceLength).toBe(0)
  })

  it('detects ich-perspective correctly', () => {
    const ichText = `Ich ging nach Hause. Ich dachte über alles nach. Mein Leben war komisch. Ich wusste nicht weiter.`

    const profile = analyzeStyle(ichText)

    expect(profile.narrativePerspective).toBe('ich')
  })

    it('detects er-perspective correctly', () => {
    const erText = `Er ging nach Hause. Er dachte über alles nach. Sein Leben war komisch. Er wusste nicht weiter.`

    const profile = analyzeStyle(erText)

    expect(profile.narrativePerspective).toBe('er')
  })
})
