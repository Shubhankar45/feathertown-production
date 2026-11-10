export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        oat: {
          canvas: "#F7F5F0",
          card: "#FFFFFF",
          surface: "#FAF8F5",
          panel: "#EFECE4",
          border: "#E2DDD3",
          muted: "#736B5E",
        },
        forest: {
          DEFAULT: "#1B3B22",
          dark: "#152B17",
          mid: "#244B27",
          light: "#36683B",
          wash: "#E7EFE8",
        },
        tomato: {
          DEFAULT: "#D9381E",
          hover: "#B82810",
          press: "#9E200C",
          wash: "#FDECE8",
          border: "#F4B8AC",
        },
        brand: {
          green: "#1B3B22",
          greenDark: "#152B17",
          greenLight: "#E7EFE8",
          orange: "#D9381E",
          orangeDark: "#B82810",
          orangeLight: "#FDECE8",
          amber: "#D9381E",
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
