import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useLanguageSwitcher } from '../hooks/useLanguageSwitcher';
import '../i18n';

function LangHarness() {
  const { currentLang, changeLanguage, languages } = useLanguageSwitcher();
  return (
    <div>
      <output data-testid="lang">{currentLang}</output>
      {languages.map((lang) => (
        <button key={lang.code} type="button" onClick={() => changeLanguage(lang.code)}>
          {lang.code}
        </button>
      ))}
    </div>
  );
}

describe('useLanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('offers the en/sw/fr language options', () => {
    render(<LangHarness />);
    for (const code of ['en', 'sw', 'fr']) {
      expect(screen.getByRole('button', { name: code })).toBeInTheDocument();
    }
  });

  it('switches the active language and persists the choice to localStorage', () => {
    render(<LangHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'sw' }));

    expect(screen.getByTestId('lang').textContent).toBe('sw');
    expect(localStorage.getItem('i18nextLng')).toBe('sw');

    fireEvent.click(screen.getByRole('button', { name: 'fr' }));

    expect(screen.getByTestId('lang').textContent).toBe('fr');
    expect(localStorage.getItem('i18nextLng')).toBe('fr');
  });
});
