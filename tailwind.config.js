/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // or whatever your source files are
  ],
  safelist: [
    'hidden',
    'md:flex',
    'items-center',
    'w-2/5',
    'lg:w-1/2',
    'relative',
    'min-w-0',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
