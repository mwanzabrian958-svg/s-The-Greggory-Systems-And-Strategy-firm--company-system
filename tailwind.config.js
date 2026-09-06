import daisyui from "daisyui"
import typography from "@tailwindcss/typography"
import { COMPANY_COLORS } from "./src/constants/siteBrand"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Official company palette — Blue & White (source: src/constants/siteBrand.js)
        ...COMPANY_COLORS,

        // Semantic aliases for easy use in class names
        'brand-navy': COMPANY_COLORS.navy,
        'brand-blue': COMPANY_COLORS.blue,
        'brand-blue-light': COMPANY_COLORS.blueLight,
        'brand-sky': COMPANY_COLORS.blueSoft,
        'brand-offwhite': COMPANY_COLORS.offwhite,

        // Legacy tokens kept so existing classes keep resolving
        'firm-gold': COMPANY_COLORS.blue,
        'firm-gold-dark': COMPANY_COLORS.blueLight,
        'firm-black': COMPANY_COLORS.navyDark,
        'firm-gray': COMPANY_COLORS.navyCard,
        'firm-slate': COMPANY_COLORS.navyBorder,
        'berk-blue': COMPANY_COLORS.navy,
        'berk-blue-dark': COMPANY_COLORS.navyDark,

        // Primary scale — company blues from soft to brand navy
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#0F2E7D',
          900: COMPANY_COLORS.navy,
        },
      },
      fontFamily: {
        'mono': ['Space Mono', 'monospace'],
        'sans': ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'heading': ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui, typography],
  daisyui: {
    themes: [
      {
        brand: {
          primary: COMPANY_COLORS.navy,
          "primary-content": COMPANY_COLORS.white,
          secondary: COMPANY_COLORS.blue,
          "secondary-content": COMPANY_COLORS.white,
          accent: COMPANY_COLORS.blueLight,
          "accent-content": COMPANY_COLORS.navyDark,
          neutral: COMPANY_COLORS.navyDark,
          "neutral-content": COMPANY_COLORS.white,
          "base-100": COMPANY_COLORS.white,
          "base-200": COMPANY_COLORS.offwhite,
          "base-300": "#E2E8F0",
          "base-content": "#0F172A",
          info: COMPANY_COLORS.blue,
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
        },
      },
      "light",
      "dark",
    ],
    logs: false,
  },
}
