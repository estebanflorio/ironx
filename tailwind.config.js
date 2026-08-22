/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14161A',
        surface: '#1C1F25',
        raised: '#23262D',
        border: '#2C2F37',
        paper: '#F1EEE7',
        muted: '#8B8F98',
        chalk: '#C9F31D',
        ember: '#FF5A3C'
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.24em'
      }
    }
  },
  plugins: []
};
