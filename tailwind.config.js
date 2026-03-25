/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#A3BFA8",
        "primary-hover": "#7FA889",
        background: "#ECEFED",
        dark: "#3e5747",
      }
    },
  },
  plugins: [],
}