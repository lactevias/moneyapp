/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './clients/index.html',
    './clients/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(255, 14%, 21%)', // Corresponds to space-border
        input: 'hsl(255, 14%, 21%)',
        ring: 'hsl(252, 55%, 76%)',
        background: 'hsl(252, 14%, 11%)', // Corresponds to space-bg
        foreground: 'hsl(0, 0%, 88%)', // Corresponds to space-text
        primary: {
          DEFAULT: 'hsl(252, 55%, 76%)', // Corresponds to brand-accent
          foreground: 'hsl(0, 0%, 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(252, 11%, 18%)', // Corresponds to space-card
          foreground: 'hsl(0, 0%, 98%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 63%, 31%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        muted: {
          DEFAULT: 'hsl(252, 11%, 18%)',
          foreground: 'hsl(257, 10%, 65%)', // Corresponds to space-text-secondary
        },
        accent: {
          DEFAULT: 'hsl(252, 11%, 18%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        popover: {
          DEFAULT: 'hsl(252, 14%, 11%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        card: {
          DEFAULT: 'hsl(252, 11%, 18%)', // Corresponds to space-card
          foreground: 'hsl(0, 0%, 98%)',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
