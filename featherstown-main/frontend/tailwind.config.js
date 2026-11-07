export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#16A34A",
          greenDark: "#15803D",
          greenLight: "#DCFCE7",
          orange: "#F97316",
          orangeDark: "#EA580C",
          orangeLight: "#FFEDD5",
          amber: "#FBBF24",
        },
      },
      keyframes: {
        shine: {
          "0%": { backgroundPosition: "100%" },
          "100%": { backgroundPosition: "-100%" },
        },
      },
      animation: {
        shine: "shine 5s linear infinite",
      },
    },
  },
  plugins: [],
};
