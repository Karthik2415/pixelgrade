/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",
        sidebar: "#111827",
        panel: "#1f2937",
        primary: "#6366f1",
        secondary: "#22c55e",
        text: "#e5e7eb",
        editorBg: "#020617"
      }
    },
  },
  plugins: [],
}
