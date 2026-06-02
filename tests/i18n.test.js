import { describe, it, expect } from 'vitest';
import {
  I18N,
  getTranslation,
  getSupportedLanguages,
  formatChatMessage,
} from '../lib/i18n.js';

describe('I18N dictionary', () => {
  it('should have EN, ES, and PT locales', () => {
    expect(Object.keys(I18N)).toEqual(expect.arrayContaining(['EN', 'ES', 'PT']));
  });

  it('should have the same keys across all locales', () => {
    const enKeys = Object.keys(I18N.EN).sort();
    const esKeys = Object.keys(I18N.ES).sort();
    const ptKeys = Object.keys(I18N.PT).sort();
    expect(esKeys).toEqual(enKeys);
    expect(ptKeys).toEqual(enKeys);
  });

  it('should not have any empty string values', () => {
    for (const [lang, dict] of Object.entries(I18N)) {
      for (const [key, val] of Object.entries(dict)) {
        expect(val, `${lang}.${key} should not be empty`).not.toBe('');
      }
    }
  });
});

describe('getTranslation', () => {
  it('should return correct EN translation', () => {
    expect(getTranslation('EN', 'nav.products')).toBe('Products');
  });

  it('should return correct ES translation', () => {
    expect(getTranslation('ES', 'nav.products')).toBe('Productos');
  });

  it('should return correct PT translation', () => {
    expect(getTranslation('PT', 'nav.products')).toBe('Produtos');
  });

  it('should fall back to EN for unknown language codes', () => {
    expect(getTranslation('FR', 'nav.products')).toBe('Products');
    expect(getTranslation('DE', 'hero.cta1')).toBe('Start a project');
  });

  it('should return undefined for unknown keys', () => {
    expect(getTranslation('EN', 'nonexistent.key')).toBeUndefined();
  });

  it('should handle CTA translations correctly', () => {
    expect(getTranslation('EN', 'cta.email')).toBe('Email Monkyfi');
    expect(getTranslation('ES', 'cta.email')).toBe('Escribir a Monkyfi');
    expect(getTranslation('PT', 'cta.email')).toBe('Escrever para Monkyfi');
  });
});

describe('getSupportedLanguages', () => {
  it('should return all supported language codes', () => {
    const langs = getSupportedLanguages();
    expect(langs).toContain('EN');
    expect(langs).toContain('ES');
    expect(langs).toContain('PT');
    expect(langs).toHaveLength(3);
  });
});

describe('formatChatMessage', () => {
  it('should convert newlines to <br> tags', () => {
    expect(formatChatMessage('line1\nline2')).toBe('line1<br>line2');
  });

  it('should convert multiple newlines', () => {
    expect(formatChatMessage('a\nb\nc')).toBe('a<br>b<br>c');
  });

  it('should convert **bold** to <strong> tags', () => {
    expect(formatChatMessage('this is **bold** text')).toBe('this is <strong>bold</strong> text');
  });

  it('should handle multiple bold sections', () => {
    expect(formatChatMessage('**a** and **b**')).toBe('<strong>a</strong> and <strong>b</strong>');
  });

  it('should handle both newlines and bold together', () => {
    expect(formatChatMessage('**Hello**\nWorld')).toBe('<strong>Hello</strong><br>World');
  });

  it('should return plain text unchanged', () => {
    expect(formatChatMessage('no formatting here')).toBe('no formatting here');
  });

  it('should handle empty string', () => {
    expect(formatChatMessage('')).toBe('');
  });
});
