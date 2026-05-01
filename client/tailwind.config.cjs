module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:        "#F8571D",
          "orange-light": "#F97A1A",
          orange: {
            DEFAULT: "#F8571D",
            hover:   "#d64d1f",
          },
          pink: {
            DEFAULT: "#F85A8E",
            dark:    "#e04880",
          },
          blue:          "#24588A",
          navy: {
            DEFAULT: "#02598E",
            dark:    "#024a75",
          },
          yellow:        "#FADF56",
          sand:          "#f5efe0",
          dark:          "#333333",
          cream:         "#fffff4",
          parchment:     "#f7f3ec",
        },
        gray: {
          300: '#D9D9D9',
          500: '##666',
          600: '##444',
          50:  '#e5e7eb',
          100: '#f3f4f6',
          200: '#e5e7eb',
        },
        amber: {
          200: '#fde68a',
        },
        accent: {
          amber:   '#b8860b',
          purple:  '##9d174d',
          pink:    '##be185d',
        },
      },
      fontSize: {
        '1.3': '1.3rem',
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
