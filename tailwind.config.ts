import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bcd0ff",
          300: "#8eb1ff",
          400: "#5a87ff",
          500: "#3563f5",
          600: "#2148db",
          700: "#1c39b0",
          800: "#1c328a",
          900: "#1c2e6e",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.04), 0 4px 12px -2px rgba(15,23,42,.06)",
        lift: "0 4px 12px -2px rgba(15,23,42,.08), 0 12px 32px -8px rgba(15,23,42,.12)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 1px 1px, rgba(15,23,42,.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
