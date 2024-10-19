import type { ReferenceConfiguration } from '@scalar/types/legacy'
import { describe, expect, it } from 'vitest'
import { apiDocs, apiReference, customThemeCSS } from '../src/scalar.ts'

const mockOptions: ReferenceConfiguration = {
  spec: {
    content: { name: 'Test API', version: '1.0' },
  },
}

describe('⬢ Validate scalar', () => {
  it('● should return a valid script tag with configuration', () => {
    const result = apiReference(mockOptions)
    expect(result).toMatch('id="api-reference"')
    expect(result).toContain('Test API')
    expect(result).toContain('1.0')
  })

  it('● should return a valid script tag with no spec', () => {
    const result = apiReference({})
    expect(result).toMatch('id="api-reference"')
  })

  it('● should return a valid script tag when content is function', () => {
    const result = apiReference({
      spec: {
        content() {
          return mockOptions.spec?.content
        },
      },
    })
    expect(result).toMatch('id="api-reference"')
    expect(result).toContain('Test API')
    expect(result).toContain('1.0')
  })

  it('● should fall back to the default CDN if not provided', () => {
    const result = apiReference({
      spec: mockOptions.spec,
    })
    expect(result).toContain(
      'https://cdn.jsdelivr.net/npm/@scalar/api-reference',
    )
  })

  describe('⬢ Validate apiDocs', () => {
    it('● should generate a complete HTML document', () => {
      const result = apiDocs(mockOptions)
      expect(result).toContain('<!DOCTYPE html>')
      expect(result).toContain('<html>')
      expect(result).toContain('<head>')
      expect(result).toContain('<body>')
      expect(result).toContain('Test API')
      expect(result).toContain(customThemeCSS)
    })

    it('● should not include customThemeCSS if theme is provided', () => {
      const result = apiDocs({
        ...mockOptions,
        theme: 'default',
      })
      expect(result).not.toContain(customThemeCSS)
    })
  })

  describe('⬢ Validate customThemeCSS', () => {
    it('● should contain light and dark mode styles', () => {
      expect(customThemeCSS).toContain('.light-mode')
      expect(customThemeCSS).toContain('.dark-mode')
    })

    it('should define scalar color and background variables', () => {
      expect(customThemeCSS).toContain('--scalar-color-1')
      expect(customThemeCSS).toContain('--scalar-background-1')
    })
  })
})
