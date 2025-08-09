/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';
import forms from '@tailwindcss/forms';

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
      
      // ===== COLOR SYSTEM =====
      colors: {
        // Core Void Theme Colors
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
          50: '#1a1a2e',   // Primary dark background
          100: '#16213e',  // Secondary background
          200: '#14213d',  // Tertiary background
          300: '#12203a',
          400: '#101e36',
          500: '#0e1c32',
          600: '#0c1a2e',
          700: '#0a182a',
          800: '#2a1a3e',  // Card background
          900: '#16161a',
          950: '#0f0f14',
        },
        'void-accent': {
          light: '#c084fc',
          DEFAULT: '#a855f7',
        },
        
        // Seductive Accent Colors
        seductive: {
          light: '#f472b6',
          DEFAULT: '#ec4899',
          dark: '#be185d',
        },
        'lust-violet': '#4B0082',
        
        // UI State Colors
        success: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d', DEFAULT: '#22c55e',
        },
        warning: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f', DEFAULT: '#f59e0b',
        },
        error: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d', DEFAULT: '#ef4444',
        },
        info: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', DEFAULT: '#3b82f6',
        },
        
        // Semantic Color Tokens (for consistent usage)
        text: {
          primary: '#ffffff',        // Main text on dark backgrounds
          secondary: '#e5e7eb',      // Secondary text
          tertiary: '#9ca3af',       // Tertiary text
          muted: '#6b7280',          // Muted text
          disabled: '#4b5563',       // Disabled text
          accent: '#ec4899',         // Accent text (seductive)
          'on-dark': '#ffffff',      // Text on dark backgrounds
          'on-light': '#1f2937',     // Text on light backgrounds
        },
        
        // Background Semantic Tokens
        background: {
          primary: '#000000',                    // Main background
          secondary: '#1a1a2e',                  // Secondary background (void-dark-50)
          tertiary: '#16213e',                   // Tertiary background (void-dark-100)
          card: '#2a1a3e',                       // Card backgrounds (void-dark-800)
          overlay: 'rgba(0, 0, 0, 0.8)',        // Overlay backgrounds
          glass: 'rgba(26, 26, 46, 0.8)',       // Glass morphism
        },
        
        // Border Semantic Tokens
        border: {
          primary: 'rgba(168, 85, 247, 0.3)',    // Primary borders (void-accent)
          secondary: 'rgba(192, 132, 252, 0.2)', // Secondary borders (void-accent-light)
          muted: 'rgba(107, 114, 128, 0.2)',     // Muted borders
          error: 'rgba(239, 68, 68, 0.5)',       // Error borders
          success: 'rgba(34, 197, 94, 0.5)',     // Success borders
          warning: 'rgba(245, 158, 11, 0.5)',    // Warning borders
        },
      },
      
      // ===== TYPOGRAPHY =====
      fontFamily: {
        'sans': ['Lato', 'ui-sans-serif', 'system-ui'],
        'serif': ['"Cormorant Garamond"', 'serif'],
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
      },
      textShadow: {
        'void-glow': '0 0 2px #fdefea, 0 0 12px rgba(192, 132, 252, 0.6), 0 0 20px rgba(75, 0, 130, 0.4)',
        'glow': '0 0 10px rgba(168, 85, 247, 0.5)',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.5)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.5)',
      },
      
      // ===== SPACING & LAYOUT =====
      spacing: {
        '18': '4.5rem', '88': '22rem', '92': '23rem', '96': '24rem', '104': '26rem',
        '112': '28rem', '128': '32rem', '144': '36rem', '160': '40rem', '176': '44rem',
        '192': '48rem', '208': '52rem', '224': '56rem', '240': '60rem', '256': '64rem',
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
      
      // ===== VISUAL EFFECTS =====
      backgroundImage: {
        // Hero Images
        'hero': "url('/background2.jpg')",
        
        // Void Theme Gradients
        'void-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #a23b72 100%)',
        'void-subtle': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'seductive-void': 'linear-gradient(135deg, #1a1a2e 0%, #a23b72 50%, #c084fc 100%)',
        
        // Brand Gradients
        'gradient-primary': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7c3aed 0%, #be185d 100%)',
        'gradient-accent': 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
        'gradient-muted': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
      },
      boxShadow: {
        // Glow Effects
        'glow-primary': '0 0 20px rgba(138, 43, 226, 0.5)',
        'glow-secondary': '0 0 20px rgba(192, 132, 252, 0.4)',
        'glow-accent': '0 0 15px rgba(168, 85, 247, 0.3)',
        'glow-seductive': '0 0 20px rgba(236, 72, 153, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(168, 85, 247, 0.2)',
        
        // Standard Shadows
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      
      // ===== ANIMATIONS =====
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(100%)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-100%)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        glow: { '0%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }, '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      transitionTimingFunction: {
        'bounce-subtle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    forms,
    plugin(function ({ matchUtilities, theme, addComponents, addUtilities }) {
      // Text Shadow Utilities
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
      
      // ===== COMPONENT CLASSES =====
      addComponents({
        
        // ===== LAYOUT COMPONENTS =====
        '.container-app': {
          '@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.container-content': {
          '@apply max-w-4xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.container-narrow': {
          '@apply max-w-2xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.container-wide': {
          '@apply max-w-9xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.container-profile': {
          '@apply max-w-full max-h-full': {},
        },

        // ===== CARD COMPONENTS =====
        '.card': {
          '@apply bg-background-card/80 backdrop-blur-sm rounded-xl shadow-card p-6 border border-border-secondary': {},
        },
        '.card-hover': {
          '@apply bg-background-card/80 backdrop-blur-sm rounded-xl shadow-card hover:shadow-card-hover p-6 border border-border-secondary hover:border-border-primary transition-all duration-300 transform hover:scale-[1.02]': {},
        },
        '.card-glass': {
          '@apply bg-background-glass backdrop-blur-md rounded-xl shadow-modal p-6 border border-border-muted': {},
        },
        '.card-elevated': {
          '@apply bg-background-card rounded-xl shadow-modal p-8 border border-border-primary': {},
        },
        
        // ===== AUTHENTICATION & SECTIONS =====
        '.auth-section': {
          '@apply bg-background-card/80 backdrop-blur-sm rounded-xl shadow-card p-6 sm:p-8 lg:p-10 border border-border-secondary': {},
        },
        '.page-section': {
          '@apply bg-background-primary': {},
        },
        '.hero-section': {
          '@apply bg-background-primary text-text-primary': {},
        },
        
        // ===== BUTTON COMPONENTS =====
        '.btn-primary': {
          '@apply bg-gradient-primary text-text-on-dark font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-glow-accent hover:shadow-glow-primary focus-ring': {},
        },
        // Consistent small ghost-outline button used for Edit profile action
        '.btn-edit': {
          '@apply px-5 py-2 rounded-full border-2 border-border-primary text-text-primary hover:bg-void-accent/10 transition-colors': {},
        },
        '.btn-secondary': {
          '@apply bg-background-card/80 hover:bg-void-dark-800 text-void-accent-light border-2 border-border-primary font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus-ring': {},
        },
        '.btn-outline': {
          '@apply bg-transparent hover:bg-void-accent text-void-accent hover:text-text-on-dark border-2 border-border-primary font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus-ring': {},
        },
        '.btn-ghost': {
          '@apply bg-transparent hover:bg-void-accent/10 text-text-secondary hover:text-text-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 focus-ring': {},
        },
        '.btn-danger': {
          '@apply bg-error hover:bg-error-600 text-text-on-dark font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus-ring': {},
        },
        '.btn-success': {
          '@apply bg-success hover:bg-success-600 text-text-on-dark font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus-ring': {},
        },
        
        // Small Button Variants
        '.btn-primary-sm': {
          '@apply bg-gradient-primary text-text-on-dark font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm hover:shadow-glow-accent focus-ring': {},
        },
        '.btn-secondary-sm': {
          '@apply bg-background-card/80 hover:bg-void-dark-800 text-void-accent-light border border-border-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm focus-ring': {},
        },
        '.btn-outline-sm': {
          '@apply bg-transparent hover:bg-void-accent text-void-accent hover:text-text-on-dark border border-border-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm focus-ring': {},
        },
        '.btn-ghost-sm': {
          '@apply bg-transparent hover:bg-void-accent/10 text-text-secondary hover:text-text-primary font-medium py-1.5 px-3 rounded-md transition-all duration-200 text-sm focus-ring': {},
        },
        
        // ===== FORM COMPONENTS =====
        '.form-input': {
          '@apply w-full px-4 py-3 border border-border-muted bg-background-secondary text-text-primary rounded-xl focus:ring-2 focus:ring-void-accent focus:border-border-primary transition-all duration-200 placeholder-text-muted': {},
          '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
            'transition': 'background-color 5000s ease-in-out 0s',
            '-webkit-box-shadow': '0 0 0 1000px #1a1a2e inset !important',
            '-webkit-text-fill-color': '#ffffff !important',
            'caret-color': 'white',
            'border-color': 'rgba(107, 114, 128, 0.2)',
          },
          '&:-webkit-autofill:focus': {
            'caret-color': 'white',
            'outline': 'none !important',
          },
        },
        '.form-input-error': {
          '@apply w-full px-4 py-3 border border-border-error bg-background-secondary text-text-primary rounded-xl focus:ring-2 focus:ring-error focus:border-border-error transition-all duration-200 placeholder-text-muted': {},
        },
        '.form-input-success': {
          '@apply w-full px-4 py-3 border border-border-success bg-background-secondary text-text-primary rounded-xl focus:ring-2 focus:ring-success focus:border-border-success transition-all duration-200 placeholder-text-muted': {},
        },
        '.form-textarea': {
          '@apply w-full px-4 py-3 border border-border-muted bg-background-secondary/50 text-text-primary rounded-xl focus:ring-2 focus:ring-void-accent focus:border-border-primary transition-all duration-200 resize-none placeholder-text-muted': {},
        },
        '.form-select': {
          '@apply w-full px-4 py-3 border border-border-muted bg-background-secondary/50 text-text-primary rounded-xl focus:ring-2 focus:ring-void-accent focus:border-border-primary transition-all duration-200': {},
        },
        '.form-label': {
          '@apply block text-sm font-medium text-text-secondary mb-2': {},
        },
        '.form-label-required': {
          '@apply block text-sm font-medium text-text-secondary mb-2 after:content-["*"] after:text-error after:ml-1': {},
        },
        '.form-help': {
          '@apply text-xs text-text-muted mt-1': {},
        },
        '.form-error': {
          '@apply text-xs text-error mt-1': {},
        },
        '.form-success': {
          '@apply text-xs text-success mt-1': {},
        },
        
        // ===== NAVIGATION COMPONENTS =====
        '.nav-link': {
          '@apply text-text-secondary hover:text-seductive transition-all duration-300 font-medium relative px-3 py-2 rounded-md hover:bg-seductive/10 focus-ring': {},
        },
        '.nav-link-active': {
          '@apply text-seductive bg-seductive/10 relative px-3 py-2 rounded-md': {},
        },
        '.nav-link-underline': {
          '&::after': {
            '@apply absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left': {},
            content: '""',
          },
        },
        '.nav-mobile-link': {
          '@apply flex items-center text-text-secondary hover:text-seductive transition-all duration-300 font-medium py-3 px-4 rounded-xl hover:bg-seductive/10 border border-transparent hover:border-border-secondary mb-2 focus-ring': {},
        },
        
        // ===== TEXT & TYPOGRAPHY =====
        '.text-gradient': {
          '@apply bg-gradient-primary bg-clip-text text-transparent': {},
        },
        '.text-gradient-accent': {
          '@apply bg-gradient-accent bg-clip-text text-transparent': {},
        },
        '.text-gradient-muted': {
          '@apply bg-gradient-muted bg-clip-text text-transparent': {},
        },
        '.text-heading': {
          '@apply font-serif font-bold text-text-primary': {},
        },
        '.text-subheading': {
          '@apply font-sans font-semibold text-text-secondary': {},
        },
        '.text-body': {
          '@apply font-sans text-text-secondary': {},
        },
        '.text-caption': {
          '@apply font-sans text-sm text-text-muted': {},
        },
        
        // ===== STATUS & INDICATOR COMPONENTS =====
        '.status-online': {
          '@apply w-3 h-3 bg-success rounded-full border-2 border-background-primary': {},
        },
        '.status-offline': {
          '@apply w-3 h-3 bg-text-muted rounded-full border-2 border-background-primary': {},
        },
        '.status-away': {
          '@apply w-3 h-3 bg-warning rounded-full border-2 border-background-primary': {},
        },
        '.status-busy': {
          '@apply w-3 h-3 bg-error rounded-full border-2 border-background-primary': {},
        },
        
        // ===== BADGE COMPONENTS =====
        '.badge': {
          '@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': {},
        },
        '.badge-primary': {
          '@apply badge bg-void-accent/20 text-void-accent-light border border-void-accent/30': {},
        },
        '.badge-secondary': {
          '@apply badge bg-text-muted/20 text-text-secondary border border-text-muted/30': {},
        },
        '.badge-success': {
          '@apply badge bg-success/20 text-success border border-success/30': {},
        },
        '.badge-warning': {
          '@apply badge bg-warning/20 text-warning border border-warning/30': {},
        },
        '.badge-error': {
          '@apply badge bg-error/20 text-error border border-error/30': {},
        },
        '.badge-trending': {
          '@apply badge bg-gradient-primary text-text-on-dark border border-seductive/30': {},
        },
        
        // ===== TAG COMPONENTS =====
        '.category-tag': {
          '@apply px-3 py-1 bg-void-accent/10 text-void-accent-light rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-void-accent hover:text-text-on-dark border border-void-accent/20 focus-ring': {},
        },
        '.category-tag-selected': {
          '@apply category-tag bg-void-accent text-text-on-dark border-void-accent': {},
        },
        '.category-tag-sm': {
          '@apply px-2 py-0.5 bg-void-accent/10 text-void-accent-light rounded-full text-xs font-medium transition-all duration-200 cursor-pointer hover:bg-void-accent hover:text-text-on-dark border border-void-accent/20 focus-ring': {},
        },
        
        // ===== ALERT COMPONENTS =====
        '.alert': {
          '@apply p-4 rounded-lg border': {},
        },
        '.alert-success': {
          '@apply alert bg-success/10 border-border-success text-success': {},
        },
        '.alert-warning': {
          '@apply alert bg-warning/10 border-border-warning text-warning': {},
        },
        '.alert-error': {
          '@apply alert bg-error/10 border-border-error text-error': {},
        },
        '.alert-info': {
          '@apply alert bg-info/10 border-info/30 text-info': {},
        },
        
        // ===== MEDIA & CREATOR COMPONENTS =====
        '.media-item': {
          '@apply rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:scale-105 border border-border-secondary focus-ring': {},
        },
        '.creator-card': {
          '@apply bg-background-card/80 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 transform hover:scale-[1.02] border border-border-secondary focus-ring': {},
        },
        '.tier-card': {
          '@apply bg-background-card/80 backdrop-blur-sm rounded-xl p-8 shadow-card border-2 border-transparent hover:border-border-primary transition-all duration-300 transform hover:scale-105 focus-ring': {},
        },
        '.tier-card-featured': {
          '@apply tier-card border-void-accent bg-gradient-to-br from-void-dark-900/90 to-void-dark-800/90 shadow-glow-accent': {},
        },
        
        // ===== LOADING & ANIMATION COMPONENTS =====
        '.loading-pulse': {
          '@apply animate-pulse bg-gradient-to-r from-void-500/20 via-void-accent/30 to-void-500/20': {},
        },
        '.loading-shimmer': {
          '@apply relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent': {},
        },
        '.float-animation': {
          '@apply animate-float': {},
        },
        '.glow-animation': {
          '@apply animate-glow': {},
        },
        
        // ===== SIDEBAR COMPONENTS =====
        '.sidebar-expanded': {
          '@apply w-60 transition-all duration-200 ease-out': {},
        },
        '.sidebar-reduced': {
          '@apply w-16 transition-all duration-200 ease-out': {},
        },
        '.sidebar-item': {
          '@apply flex items-center justify-between w-full px-3 py-2.5 rounded-md transition-all duration-200 group relative text-text-secondary hover:text-text-primary hover:bg-background-card': {},
        },
        '.sidebar-item-active': {
          '@apply bg-void-accent/10 text-void-accent border-l-2 border-void-accent -ml-[2px] pl-[14px]': {},
        },
        '.sidebar-tooltip': {
          '@apply absolute left-full ml-2 px-2 py-1 text-xs font-medium text-text-primary bg-background-card border border-border-primary rounded-md whitespace-nowrap shadow-lg z-50 pointer-events-none': {},
        },
        
        // ===== LOGO & RESPONSIVE COMPONENTS =====
        '.logo-responsive': {
          '@apply transition-all duration-300 ease-in-out': {},
        },
        '.logo-full': {
          '@apply logo-responsive h-64 w-80 bg-contain bg-no-repeat bg-left': {},
        },
        '.logo-compact': {
          '@apply logo-responsive h-16 w-16 bg-contain bg-no-repeat bg-center mx-4': {},
        },
        
      })
      
      // ===== UTILITY CLASSES =====
      addUtilities({
        // Line Clamp Utilities
        '.line-clamp-1': {
          display: '-webkit-box',
          '-webkit-line-clamp': '1',
          'line-clamp': '1',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          'line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-3': {
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          'line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        
        // Glass Effects
        '.glass': {
          '@apply bg-background-glass backdrop-blur-md': {},
        },
        '.glass-strong': {
          '@apply bg-background-overlay backdrop-blur-lg': {},
        },
        
        // Scrollbar Styling
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(168, 85, 247, 0.3) transparent',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'rgba(168, 85, 247, 0.3)',
            'border-radius': '3px',
            '&:hover': {
              'background-color': 'rgba(168, 85, 247, 0.5)',
            },
          },
        },
        
        // Focus States
        '.focus-ring': {
          '@apply focus:ring-2 focus:ring-void-accent focus:ring-offset-2 focus:ring-offset-background-primary focus:outline-none': {},
        },
        '.focus-ring-inset': {
          '@apply focus:ring-2 focus:ring-inset focus:ring-void-accent focus:outline-none': {},
        },
      })
    }),
  ],
}