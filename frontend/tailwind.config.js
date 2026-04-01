/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(16,185,129,.10), 0 18px 60px rgba(0,0,0,.45)"
      },
      borderRadius: { panel: "28px" }
    },
  },
  plugins: [],
}
