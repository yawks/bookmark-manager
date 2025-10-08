/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['[class*="theme-dark"]'],
  content: [
    './src/**/*.{ts,tsx}',
    '../templates/**/*.php',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)',
        input: 'var(--color-border)',
        ring: 'var(--color-primary-element)',
        background: 'var(--color-main-background)',
        foreground: 'var(--color-main-text)',
        primary: {
          DEFAULT: 'var(--color-primary-element)',
          foreground: 'var(--color-primary-text)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-element)',
          foreground: 'var(--color-secondary-text)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error)',
        },
        muted: {
          DEFAULT: 'var(--color-background-dark)',
          foreground: 'var(--color-main-text)',
        },
        accent: {
          DEFAULT: 'var(--color-primary-element-light)',
          foreground: 'var(--color-primary-text)',
        },
        popover: {
          DEFAULT: 'var(--color-main-background)',
          foreground: 'var(--color-main-text)',
        },
        card: {
          DEFAULT: 'var(--color-main-background-blur)',
          foreground: 'var(--color-main-text)',
        },
      },
      borderRadius: {
        lg: "var(--border-radius-large)",
        md: "var(--border-radius)",
        sm: "var(--border-radius-small)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}