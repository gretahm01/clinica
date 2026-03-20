/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#A3BFA8",       // verde principal
        "primary-hover": "#7FA889", // verde hover
        background: "#ECEFED",    // fondo
        dark: "#3e5747",          // texto oscuro
      }
    },
  },
  plugins: [],
}