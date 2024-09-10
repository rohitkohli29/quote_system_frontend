import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightblue: '#EFF6FC',
        active_stepbar_color: "#0085D1",
        home_bg: '#f5f5f5'
      }
    },
  },
  plugins: [],
};
