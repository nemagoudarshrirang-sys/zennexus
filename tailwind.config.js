/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "#090b10",
        panel: "#12161f",
        line: "#232a38",
        muted: "#8c95a7",
        accent: "#f4f7ff"
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "Tahoma", "sans-serif"]
      }
    }
  },
  plugins: []
};
