export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: "#1E40AF",
        "primary-container": "#1e40af",
        secondary: "#7C3AED",
        tertiary: "#059669",
        surface: "#F8FAFC",
        "on-surface": "#0d1c2e",
        outline: "#757684",
      },
    },
  },
  plugins: [],
}