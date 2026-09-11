import { describe, it, expect } from 'vitest';

import en from '../i18n/locales/en.json';
import sw from '../i18n/locales/sw.json';
import fr from '../i18n/locales/fr.json';
import fixtures from '../../__tests__/i18n-fixtures.cjs';

type LocaleMap = Record<string, string>;

const keys = (o: object) => Object.keys(o as LocaleMap).sort();

describe('i18n locales', () => {
  it('en, sw, fr expose the identical key set', () => {
    const enKeys = keys(en);
    expect(keys(sw)).toEqual(enKeys);
    expect(keys(fr)).toEqual(enKeys);
  });

  it('every translation value is a non-empty string', () => {
    for (const locale of [en, sw, fr] as LocaleMap[]) {
      for (const [k, v] of Object.entries(locale)) {
        expect(typeof v, `${k} must be a string`).toBe('string');
        expect(v.trim().length, `${k} must not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it('fixtures stay in sync with the live english locale (no accidental key drift)', () => {
    expect(keys(fixtures.en)).toEqual(keys(en));
    expect(keys(fixtures.sw)).toEqual(keys(sw));
    expect(keys(fixtures.fr)).toEqual(keys(fr));
  });

  it('fixture values match the live english locale', () => {
    expect(fixtures.en['app.title']).toBe(en['app.title']);
    expect(fixtures.en['auth.login']).toBe(en['auth.login']);
  });
});
