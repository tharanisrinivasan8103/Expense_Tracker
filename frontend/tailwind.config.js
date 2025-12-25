/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // IMPORTANT so Tailwind scans all your React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
