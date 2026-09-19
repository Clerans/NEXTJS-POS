/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        patina: {
          DEFAULT: "var(--patina)",
          dark: "var(--patina-dark)",
          secondary: "var(--patina-secondary)",
          accent: "var(--patina-accent)",
          light: "var(--patina-light)",
        },
        bg: "var(--bg)",
        cardBg: "var(--card-bg)",
        border: "var(--border)",
        textDark: "var(--text-dark)",
        textGray: "var(--text-gray)",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
