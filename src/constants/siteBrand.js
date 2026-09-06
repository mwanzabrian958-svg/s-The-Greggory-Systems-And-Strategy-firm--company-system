// ============================================================
// The Greggory Systems & Strategy Firm — Brand Identity
// Single source of truth for name / tagline / company colors.
// ============================================================

export const SITE_NAME = 'The-Greggory-Systems-And-Strategy-firm'
export const SITE_TAGLINE = 'Strategic Systems • Practical Strategy • Lasting Confidence'
export const SITE_MOTTO = 'Strategic Systems • Tactical Strategy • Lasting Confidence'
export const SITE_DESCRIPTION = `${SITE_NAME} - ${SITE_TAGLINE}`

/**
 * Official company palette — Blue & White.
 * Deep navy + crisp white core, with bright blues for accents and
 * navy-tinted dark surfaces so dark mode stays on-brand (no black/gold).
 */
export const COMPANY_COLORS = {
  // Core brand
  navy: '#002D62',       // primary brand blue (deep navy)
  white: '#FFFFFF',      // primary light surface

  // Blues — accents & actions
  blue: '#3B82F6',       // action / emphasis blue
  blueLight: '#60A5FA',  // bright blue for dark backgrounds
  blueSoft: '#93C5FD',   // soft blue for decorative touches

  // Dark surfaces (replaces pure-black dark mode)
  navyDark: '#00122B',   // page background (dark mode)
  navyCard: '#032457',   // card / panel surface (dark mode)
  navyBorder: '#0E3A6E', // borders & dividers (dark mode)

  // Neutrals
  offwhite: '#F8FAFC',   // soft white background
}
