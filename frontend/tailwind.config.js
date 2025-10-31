/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Navy, Royal Blue, Platinum Silver Palette (60-30-10 Rule)
        brand: {
          navy: '#0E1A2B',      // Deep Navy - Primary Background (60%)
          blue: '#3A7BD5',      // Royal Blue - Primary Accent (10%)
          silver: '#D9D9D9',    // Platinum Silver - Text/Neutral Surface (30%)
        },
        // Primary colors based on Deep Navy (#0E1A2B) - 60% usage
        primary: {
          50: '#f8f9fb',
          100: '#f1f3f7',
          200: '#e3e7ef',
          300: '#d1d7e3',
          400: '#bbc4d5',
          500: '#a0abc3',
          600: '#8691ad',
          700: '#6d7896',
          800: '#5a647b',
          900: '#4a5265',
          950: '#0E1A2B', // Your Deep Navy color
        },
        // Secondary colors based on Royal Blue (#3A7BD5) - 10% usage for accents
        secondary: {
          50: '#f0f6fe',
          100: '#deeafc',
          200: '#c4dcf9',
          300: '#9bc7f5',
          400: '#6ba9ee',
          500: '#4a8be7',
          600: '#3A7BD5', // Your Royal Blue color
          700: '#2c5fb0',
          800: '#29508f',
          900: '#264674',
          950: '#1a2c47',
        },
        // Accent colors based on Platinum Silver (#D9D9D9) - 30% usage
        accent: {
          50: '#f9f9f9',
          100: '#f4f4f4',
          200: '#e9e9e9',
          300: '#D9D9D9', // Your Platinum Silver color
          400: '#c4c4c4',
          500: '#a9a9a9',
          600: '#8f8f8f',
          700: '#757575',
          800: '#606060',
          900: '#4a4a4a',
          950: '#262626',
        },
        // Neutral grays for text and UI elements
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Success colors using navy variations
        success: {
          50: '#f0f9f4',
          100: '#dcf4e4',
          200: '#bce8cd',
          300: '#8dd4aa',
          400: '#57b97f',
          500: '#34a05e',
          600: '#26814a',
          700: '#20663d',
          800: '#1d5133',
          900: '#18432b',
        },
        // Warning colors
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
        },
        // Error colors
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
        },
        // Direct brand color aliases for easy access
        navy: '#0E1A2B',
        'royal-blue': '#3A7BD5',
        'platinum': '#D9D9D9',
        'deep-navy': '#0E1A2B',
        'bright-blue': '#3A7BD5',
        'light-silver': '#D9D9D9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
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
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(14, 26, 43, 0.1), 0 10px 20px -2px rgba(14, 26, 43, 0.05)',
        'medium': '0 4px 25px -5px rgba(14, 26, 43, 0.15), 0 10px 10px -5px rgba(14, 26, 43, 0.08)',
        'strong': '0 10px 40px -10px rgba(14, 26, 43, 0.2), 0 2px 4px -1px rgba(14, 26, 43, 0.1)',
        'glow': '0 0 20px rgba(58, 123, 213, 0.3)',
        'glow-navy': '0 0 20px rgba(14, 26, 43, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
}

