// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'prose',
    'prose-sm',
    'dark:prose-invert',
  ],
  theme: {
    extend: {
      colors: {
        'primary': { light: '#818cf8', DEFAULT: '#6366f1', dark: '#4f46e5' }, // Indigo-500, Indigo-600
        'secondary': { light: '#9ca3af', DEFAULT: '#6b7280', dark: '#4b5563' }, // Slate-500...
        'accent': '#a855f7', // Purple-500 (matching landing gradient)
        'background-dark': '#020617', // Slate-950
        'surface-dark': '#0f172a',    // Slate-900 (was 800 previously, now darker)
        'border-dark': '#1e293b',     // Slate-800
        'text-dark': '#f8fafc',       // Slate-50
        'text-muted-dark': '#94a3b8', // Slate-400
        'background-light': '#f8fafc', // Slate-50
        'surface-light': '#ffffff',    // White
        'border-light': '#e2e8f0',     // Slate-200
        'text-light': '#0f172a',       // Slate-900
        'text-light': '#0f172a',       // Slate-900
        'text-muted-light': '#64748b', // Slate-500

        // --- CHAT SPECIFIC PALETTE (Scoped) ---
        'chat': {
          'bg': { light: '#ffffff', dark: '#212121' },         // Main background (ChatGPT dark gray)
          'sidebar': { light: '#f9f9f9', dark: '#171717' },    // Darker sidebar
          'surface': { light: '#ffffff', dark: '#2f2f2f' },    // Input, Cards
          'hover': { light: '#f3f4f6', dark: '#424242' },     // Hover states
          'bubble-user': { light: '#f3f4f6', dark: '#2f2f2f' }, // User bubbles
          'text': { light: '#0f172a', dark: '#ececec' },       // Main text (High contrast)
          'text-muted': { light: '#6b7280', dark: '#b4b4b4' }, // Secondary text
          'accent': { light: '#10a37f', DEFAULT: '#10a37f', dark: '#10a37f' }, // OpenAI Green/Teal feel? Or stay Blue?
          // Let's go with a professional "ChatGPT-like" Black/White/Gray theme, with minimal accent.
          // Actually, let's keep the Accent as a subtle blue-grey or stick to the user's "New Consistent Palette".
          // I'll define a unique "Chat Blue" that is cleaner.
          'action': { light: '#2563eb', DEFAULT: '#3b82f6', dark: '#60a5fa' } // Standard blue, distinct from global Indigo
        },
      },
      fontFamily: {
        sans: ['"Inter var"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'main': '0 4px 15px -5px rgba(0,0,0,0.07), 0 2px 8px -6px rgba(0,0,0,0.07)',
        'panel': '0 8px 20px -5px rgba(0,0,0,0.1), 0 4px 10px -6px rgba(0,0,0,0.08)',
        'card-hover': '0 6px 18px -4px rgba(0,0,0,0.1), 0 3px 10px -5px rgba(0,0,0,0.1)',
      },
      borderRadius: { 'xl': '0.75rem', '2xl': '1rem', 'panel': '0.75rem' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(5px)' }, '100%': { opacity: '1', transform: 'translateY(0px)' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseDots: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmerSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-border': {
          '0%': { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.4s ease-out forwards',
        pulseDot1: 'pulseDots 1.4s infinite 0s ease-in-out',
        pulseDot2: 'pulseDots 1.4s infinite 0.2s ease-in-out',
        pulseDot3: 'pulseDots 1.4s infinite 0.4s ease-in-out',
        shimmerSweep: 'shimmerSweep 1.5s linear infinite',
        'spin-border': 'spin-border 4s linear infinite',
        'caret-blink': 'caret-blink 1.2s ease-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/typography'),
  ],
}