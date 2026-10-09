/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Gelato Borelli - Verde Italiano Artesanal & Creme Amarelado
        borelli: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#cbd8cb',
          300: '#a3be9e',
          400: '#759d72',
          500: '#527e50',
          600: '#3f643e',
          700: '#325032',
          800: '#273e27',
          900: '#1e3220', // Verde Borelli Oficial
          950: '#121f13', // Verde Noturno Profundo
        },
        cream: {
          50: '#fdfcf9',
          100: '#fbf8f1', // Branco Amarelado Clássico Gelato
          200: '#f5eedc',
          300: '#ede2c7',
          400: '#ded0ad',
          500: '#c8b58a',
          600: '#b0996f',
          700: '#8f7854',
          800: '#746146',
          900: '#60503b',
        },
        brand: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#cbd8cb',
          300: '#a3be9e',
          400: '#759d72',
          500: '#3f643e',
          600: '#2c4c2f',
          700: '#233f25',
          800: '#1e3220',
          900: '#142316',
          950: '#0c160e',
        },
      },
    },
  },
  plugins: [],
};
