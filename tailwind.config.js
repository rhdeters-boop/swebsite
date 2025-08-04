/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy pink theme for backwards compatibility
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        'brand-pink': '#ec4899',
        'brand-pink-light': '#f9a8d4',
        'brand-pink-dark': '#be185d',
        
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
        // Custom minimal palette
        main: '#0a020d',
        body: '#fdefea',
        accent1: '#6400c2',
        accent2: '#a8211f'
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'void-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #a23b72 100%)',
        'void-subtle': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'seductive-void': 'linear-gradient(135deg, #1a1a2e 0%, #a23b72 50%, #c084fc 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
