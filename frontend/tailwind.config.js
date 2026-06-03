/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rouge: {
          DEFAULT: '#FC3D32',
          light: '#FFF5F5',
          dark: '#D32F2F',
        },
        vert: {
          DEFAULT: '#007E3A',
          light: '#F0FDF4',
          dark: '#005F2B',
        },
      },
    },
  },
  plugins: [],
}
