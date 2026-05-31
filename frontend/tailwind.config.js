/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f4c81',
          light: '#3b82f6',
          dark: '#0b3a64',
        },
      },
    },
  },
  plugins: [],
};
