/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0A0A0A',
          raised: '#141414',
          overlay: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#FF5100',
          hover: '#ff641a',
        },
        ink: {
          muted: '#9ca3af',
          faint: '#6b7280',
        },
        line: {
          subtle: 'rgba(255,255,255,0.08)',
          soft: 'rgba(255,255,255,0.05)',
        },
      },
    },
  },
  plugins: [],
}
