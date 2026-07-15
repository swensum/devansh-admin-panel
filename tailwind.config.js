/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0C',
        surface: '#16171A',
        'surface-alt': '#1D1E22',
        border: '#2A2B30',
        muted: '#9C9CA3',
        amber: '#F5AB1E',
        success: '#4CAF50',
        danger: '#E5484D',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
