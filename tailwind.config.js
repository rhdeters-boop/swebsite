/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'nav': '850px', // Custom breakpoint for navigation switch
      },
      colors: {
        // Primary Brand Colors (Abyss Theme)
        'abyss': {
          'black': '#000000',
          'dark-gray': '#333333',
          'light-gray': '#cccccc',
        },
        
        // Void theme - Dark and seductive with purple/magenta accents
        void: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d6ceff',
          300: '#b8a7ff',
          400: '#9575ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3f2163',
          950: '#1a0a2e',
        },
        'void-dark': {
          50: '#1a1a2e',
          100: '#16213e',
          200: '#14213d',
          300: '#12203a',
          400: '#101e36',
          500: '#0e1c32',
          600: '#0c1a2e',
          700: '#0a182a',
          800: '#2a1a3e',
          900: '#16161a',
          950: '#0f0f14',
        },
        'void-accent': {
          light: '#c084fc',
          DEFAULT: '#a855f7',
          dark: '#7c3aed',
        },
        'seductive': {
          light: '#f472b6',
          DEFAULT: '#ec4899',
          dark: '#be185d',
        },
        'lust-violet': '#4B0082',
        
        // Semantic colors for UI states
        'brand': {
          pink: '#ec4899',
          'pink-light': '#f472b6',
          'pink-dark': '#be185d',
        },
        
        // UI State Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#22c55e',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
        
        // Text colors for consistent hierarchy
        text: {
          primary: '#ffffff',
          secondary: '#e5e7eb',
          tertiary: '#9ca3af',
          muted: '#6b7280',
          disabled: '#4b5563',
          'on-dark': '#ffffff',
          'on-light': '#1f2937',
        },
        
        // Background variants
        background: {
          primary: '#000000',
          secondary: '#1a1a2e',
          tertiary: '#16213e',
          card: '#2a1a3e',
          overlay: 'rgba(0, 0, 0, 0.8)',
          'glass': 'rgba(26, 26, 46, 0.8)',
        },
        
        // Border variants
        border: {
          primary: 'rgba(168, 85, 247, 0.3)',
          secondary: 'rgba(192, 132, 252, 0.2)',
          muted: 'rgba(107, 114, 128, 0.2)',
          error: 'rgba(239, 68, 68, 0.5)',
          success: 'rgba(34, 197, 94, 0.5)',
          warning: 'rgba(245, 158, 11, 0.5)',
        },
      },
      fontFamily: {
        'sans': ['Lato', 'ui-sans-serif', 'system-ui'],
        'serif': ['"Cormorant Garamond"', 'serif'],
        'display': ['"Cormorant Garamond"', 'serif'], // For headings
        'body': ['Lato', 'sans-serif'], // For body text
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '4rem' }],
        '7xl': ['4.5rem', { lineHeight: '4.5rem' }],
        '8xl': ['6rem', { lineHeight: '6rem' }],
        '9xl': ['8rem', { lineHeight: '8rem' }],
        // Display sizes for marketing content
        'display-xs': ['1.5rem', { lineHeight: '2rem' }],
        'display-sm': ['1.875rem', { lineHeight: '2.25rem' }],
        'display-md': ['2.25rem', { lineHeight: '2.5rem' }],
        'display-lg': ['3rem', { lineHeight: '3.5rem' }],
        'display-xl': ['3.75rem', { lineHeight: '4rem' }],
        'display-2xl': ['4.5rem', { lineHeight: '4.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '92': '23rem',
        '96': '24rem',
        '104': '26rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem',
        '208': '52rem',
        '224': '56rem',
        '240': '60rem',
        '256': '64rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      },
      minHeight: {
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
      },
      backgroundImage: {
        'hero': "url('/background2.jpg')",
        'void-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #a23b72 100%)',
        'void-subtle': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'seductive-void': 'linear-gradient(135deg, #1a1a2e 0%, #a23b72 50%, #c084fc 100%)',
        'gradient-primary': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7c3aed 0%, #be185d 100%)',
        'gradient-accent': 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
        'gradient-muted': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
      },
      textShadow: {
        'glow': '0 0 8px rgba(192, 132, 252, 0.4)',
        'void-glow': '0 0 2px #fdefea, 0 0 12px rgba(192, 132, 252, 0.6), 0 0 20px rgba(75, 0, 130, 0.4)',
        'text-glow': '0 0 10px rgba(168, 85, 247, 0.5)',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.5)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.5)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(138, 43, 226, 0.5)',
        'glow-secondary': '0 0 20px rgba(192, 132, 252, 0.4)',
        'glow-accent': '0 0 15px rgba(168, 85, 247, 0.3)',
        'glow-seductive': '0 0 20px rgba(236, 72, 153, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner-glow': 'inset 0 0 20px rgba(168, 85, 247, 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-subtle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
}