/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F513E',
          'primary-hover': '#166952',
          'primary-active': '#0a3a2c',
          'primary-light': '#e8f3ef',
          accent: '#00A97A',
          'accent-hover': '#00946b',
          'accent-light': '#e6f7f2',
        },
        surface: {
          base: '#ffffff',
          subtle: '#f8fafc',
          muted: '#f1f5f9',
          border: '#e2e8f0',
          'border-strong': '#cbd5e1',
          foreground: '#0f172a',
          'foreground-muted': '#475569',
          'foreground-subtle': '#64748b',
        },
        semantic: {
          success: {
            DEFAULT: '#15803d',
            bg: '#f0fdf4',
            border: '#bbf7d0',
            text: '#166534',
          },
          warning: {
            DEFAULT: '#b45309',
            bg: '#fffbeb',
            border: '#fde68a',
            text: '#92400e',
          },
          danger: {
            DEFAULT: '#b91c1c',
            bg: '#fef2f2',
            border: '#fecaca',
            text: '#991b1b',
          },
          info: {
            DEFAULT: '#0369a1',
            bg: '#f0f9ff',
            border: '#bae6fd',
            text: '#075985',
          },
          neutral: {
            DEFAULT: '#64748b',
            bg: '#f8fafc',
            border: '#e2e8f0',
            text: '#334155',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        indeterminate: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
      },
      animation: {
        indeterminate: 'indeterminate 1.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
