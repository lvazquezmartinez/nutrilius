/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Base ───────────────────────────────────────
        base:    '#F5F6F7',
        surface: '#FFFFFF',
        subtle:  '#EEF0F2',

        // ─── Primary (teal-navy) ────────────────────────
        primary: {
          50:  '#F0F6FA',
          100: '#E3EDF4',
          200: '#C2D7E6',
          300: '#8FB5CE',
          400: '#5490B2',
          500: '#2D6A8F',
          600: '#255A7D',
          700: '#1E4D6B',  // main
          800: '#163D57',
          900: '#0D2233',
        },

        // ─── Accent (measured green) ────────────────────
        accent: {
          50:  '#F0FAF5',
          100: '#E3F4EE',
          200: '#B8E5D3',
          300: '#80CEB2',
          400: '#52B892',
          500: '#3DAA7F',  // main
          600: '#2D8A68',
          700: '#236B52',
          800: '#1A4F3C',
          900: '#0F3326',
        },

        // ─── Semantic ───────────────────────────────────
        danger:  { DEFAULT: '#C0392B', light: '#FBEAEA', border: '#E8A0A0' },
        warning: { DEFAULT: '#D4891A', light: '#FDF3E3', border: '#F0C87A' },
        success: { DEFAULT: '#2D7A5F', light: '#E3F4EE', border: '#80CEB2' },

        // ─── Text ───────────────────────────────────────
        text: {
          primary:   '#131A1F',
          secondary: '#3D4F5C',
          muted:     '#5E6E7C',
          disabled:  '#9AAAB6',
          inverse:   '#FFFFFF',
        },

        // ─── Border ─────────────────────────────────────
        border: {
          strong:  '#C5CDD5',
          base:    '#DDE2E7',
          subtle:  '#EEF0F2',
        },
      },

      fontFamily: {
        sans:  ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono:  ['"IBM Plex Mono"', 'Menlo', 'monospace'],
      },

      fontSize: {
        'xs':   ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'md':   ['15px', { lineHeight: '24px' }],
        'lg':   ['17px', { lineHeight: '26px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
        '3xl':  ['30px', { lineHeight: '38px' }],
        '4xl':  ['38px', { lineHeight: '46px' }],
        'display': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
      },

      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
      },

      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
      },

      boxShadow: {
        'xs':  '0 1px 2px 0 rgba(19,26,31,0.05)',
        'sm':  '0 1px 3px 0 rgba(19,26,31,0.08), 0 1px 2px -1px rgba(19,26,31,0.06)',
        'md':  '0 4px 8px -2px rgba(19,26,31,0.08), 0 2px 4px -2px rgba(19,26,31,0.04)',
        'lg':  '0 12px 24px -4px rgba(19,26,31,0.10), 0 4px 8px -2px rgba(19,26,31,0.06)',
        'focus': '0 0 0 3px rgba(30,77,107,0.20)',
        'focus-accent': '0 0 0 3px rgba(61,170,127,0.20)',
      },

      transitionDuration: {
        DEFAULT: '150ms',
        'fast': '100ms',
        'slow': '250ms',
      },
    },
  },
  plugins: [],
}
