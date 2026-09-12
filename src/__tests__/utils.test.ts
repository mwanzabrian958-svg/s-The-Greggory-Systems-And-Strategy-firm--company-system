import { describe, it, expect } from 'vitest';

import {
  formatKSH,
  formatCurrency,
  getCurrencyByCode,
  getDefaultCurrency,
} from '../utils/currencyUtils';
import { KRA_RATES, TAX_PRESETS, rateToPct, taxLabel, roundMoney } from '../utils/kraTax';
import { getDeviceCategory } from '../utils/device';
import { SITE_NAME, SITE_TAGLINE, SITE_MOTTO, COMPANY_COLORS } from '../constants/siteBrand';
import companies from '../data/companies';

describe('currencyUtils', () => {
  it('formats amounts as KSH with 2 decimals', () => {
    expect(formatKSH(1000)).toContain('KSH');
    expect(formatKSH(1000)).toContain('1,000.00');
    expect(formatKSH('250.5')).toContain('250.50');
    expect(formatKSH(0)).toContain('0.00');
  });

  it('formatCurrency delegates to formatKSH', () => {
    expect(formatCurrency(99.9)).toBe(formatKSH(99.9));
  });

  it('looks up currencies case-insensitively', () => {
    expect(getCurrencyByCode('kes')?.symbol).toBe('KSH');
    expect(getCurrencyByCode('KES')?.symbol).toBe('KSH');
    expect(getCurrencyByCode('USD')).toBeUndefined();
  });

  it('returns KES as the default currency', () => {
    expect(getDefaultCurrency()?.code).toBe('KES');
  });
});

describe('kraTax', () => {
  it('exposes the KRA rate constants and presets', () => {
    expect(KRA_RATES.VAT_STANDARD_PCT).toBe(16);
    expect(KRA_RATES.WITHHOLDING_PROFESSIONAL_PCT).toBe(5);
    expect(TAX_PRESETS.length).toBeGreaterThan(0);
  });

  it('rateToPct converts stored rates to display percents', () => {
    expect(rateToPct(0.16)).toBe(16);
    expect(rateToPct(16)).toBe(16);
    expect(rateToPct(0)).toBe(0);
    expect(rateToPct('bad')).toBe(0);
  });

  it('taxLabel produces KRA-aware labels', () => {
    expect(taxLabel(16)).toBe('VAT (16%)');
    expect(taxLabel(5)).toBe('Withholding Tax (5%)');
    expect(taxLabel(0)).toBe('');
    expect(taxLabel(7)).toBe('Tax (7%)');
  });

  it('roundMoney rounds to cents', () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(roundMoney(10.004)).toBe(10);
  });
});

describe('device + brand + companies', () => {
  it('categorises viewport widths', () => {
    expect(getDeviceCategory(320)).toBe('device-mobile');
    expect(getDeviceCategory(640)).toBe('device-mobile');
    expect(getDeviceCategory(641)).toBe('device-tablet');
    expect(getDeviceCategory(1024)).toBe('device-tablet');
    expect(getDeviceCategory(1025)).toBe('device-desktop');
  });

  it('exposes the brand constants', () => {
    expect(SITE_NAME).toBe('The-Greggory-Systems-And-Strategy-firm');
    expect(SITE_TAGLINE.length).toBeGreaterThan(0);
    expect(SITE_MOTTO.length).toBeGreaterThan(0);
    expect(COMPANY_COLORS.navy).toBe('#002D62');
  });

  it('exposes the companies list', () => {
    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);
    expect(companies[0].path).toBe('/about');
  });
});
