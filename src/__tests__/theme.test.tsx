import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/layout/Header'
import { useTextStore } from '@/store/text-store'
import { usePersonaStore } from '@/store/persona-store'
import { useExecutionStore } from '@/store/execution-store'
import { useSettingsStore } from '@/store/settings-store'

// Mock the stores
vi.mock('@/store/text-store')
vi.mock('@/store/persona-store')
vi.mock('@/store/execution-store')
vi.mock('@/store/settings-store')
vi.mock('@/processors/file-parser', () => ({
  parseFile: vi.fn(),
  validateFile: vi.fn().mockReturnValue({ valid: true }),
}))

describe('Theme Toggle', () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.classList.remove('dark', 'light')
    
    // Mock store implementations - need to handle Zustand selector pattern
    const mockGetActiveText = vi.fn().mockReturnValue({
      id: 'test-id',
      name: 'Test',
      content: 'Test content',
      metadata: {
        wordCount: 10,
        characterCount: 100,
        lineCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    
    vi.mocked(useTextStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          texts: [],
          activeTextId: null,
          getActiveText: mockGetActiveText,
          addText: vi.fn(),
          setActiveText: vi.fn(),
        })
      }
      return {
        texts: [],
        activeTextId: null,
        getActiveText: mockGetActiveText,
        addText: vi.fn(),
        setActiveText: vi.fn(),
      }
    }) as any)
    
    vi.mocked(usePersonaStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          personas: [],
          activePersonaIds: [],
          getActivePersonas: vi.fn().mockReturnValue([]),
        })
      }
      return {
        personas: [],
        activePersonaIds: [],
        getActivePersonas: vi.fn().mockReturnValue([]),
      }
    }) as any)
    
    vi.mocked(useExecutionStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          isRunning: false,
        })
      }
      return {
        isRunning: false,
      }
    }) as any)
    
    vi.mocked(useSettingsStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          theme: 'dark',
          setTheme: vi.fn(),
        })
      }
      return {
        theme: 'dark',
        setTheme: vi.fn(),
      }
    }) as any)
  })

  it('renders theme toggle button', () => {
    render(<Header onExport={vi.fn()} />)
    const themeButton = screen.getByRole('button', { name: /theme wechseln/i })
    expect(themeButton).toBeInTheDocument()
  })

  it('calls setTheme when clicked', () => {
    const mockSetTheme = vi.fn()
    vi.mocked(useSettingsStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          theme: 'dark',
          setTheme: mockSetTheme,
        })
      }
      return {
        theme: 'dark',
        setTheme: mockSetTheme,
      }
    }) as any)
    
    render(<Header onExport={vi.fn()} />)
    const themeButton = screen.getByRole('button', { name: /theme wechseln/i })
    fireEvent.click(themeButton)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('toggles between dark and light themes', () => {
    const mockSetTheme = vi.fn()
    vi.mocked(useSettingsStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          theme: 'light',
          setTheme: mockSetTheme,
        })
      }
      return {
        theme: 'light',
        setTheme: mockSetTheme,
      }
    }) as any)
    
    render(<Header onExport={vi.fn()} />)
    const themeButton = screen.getByRole('button', { name: /theme wechseln/i })
    fireEvent.click(themeButton)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('applies dark class to document when theme is dark', () => {
    vi.mocked(useSettingsStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          theme: 'dark',
          setTheme: vi.fn(),
        })
      }
      return {
        theme: 'dark',
        setTheme: vi.fn(),
      }
    }) as any)
    
    render(<Header onExport={vi.fn()} />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('applies light class to document when theme is light', () => {
    vi.mocked(useSettingsStore).mockImplementation(((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          theme: 'light',
          setTheme: vi.fn(),
        })
      }
      return {
        theme: 'light',
        setTheme: vi.fn(),
      }
    }) as any)
    
    render(<Header onExport={vi.fn()} />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
