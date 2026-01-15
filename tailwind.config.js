/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        'screen-dynamic': '100dvh',
      },
      minHeight: {
        'screen-dynamic': '100dvh',
      },
    },
  },
  plugins: [],
}
