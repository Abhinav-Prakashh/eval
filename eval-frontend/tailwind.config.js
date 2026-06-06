export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: "#00288e",
        "primary-container": "#1e40af",
        "on-primary": "#ffffff",
        "on-primary-container": "#a8b8ff",
        secondary: "#712ae2",
        "secondary-container": "#8a4cfc",
        "on-secondary": "#ffffff",
        tertiary: "#003d28",
        "tertiary-container": "#00563a",
        "on-tertiary-container": "#5bcf9e",
        surface: "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e6eeff",
        "surface-container-high": "#dce9ff",
        "on-surface": "#0d1c2e",
        "on-surface-variant": "#444653",
        outline: "#757684",
        "outline-variant": "#c4c5d5",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
      },
    },
  },
  plugins: [],
}