/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{jsx,js}'],
  theme: {
    colors: {
      ...colors
      // 'cyan': {
      //   100: '#cffafe',
      //   200: '#a5f3fc',
      //   300: '#67e8f9',
      //   400: '#22d3ee',
      // },
      // 'teal': {
      //   100: '#ccfbf1',
      //   200: '#99f6e4',
      //   300: '#5eead4'
      // }
    },
    extend: {
      maxHeight: {
        '128': '32rem',
      }
    },
  },
  plugins: [],
}

