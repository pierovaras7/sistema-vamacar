import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
        // Colores adicionales
        lamaRed: "#E74C3C",  // Rojo
        lamaRedLight: "#F5B7B1", // Rojo claro
        lamaGreen: "#2ECC71",  // Verde
        lamaGreenLight: "#58D68D", // Verde claro
        lamaBlue: "#3498DB",  // Azul
        lamaBlueLight: "#5DADE2",  // Azul claro
        lamaOrange: "#F39C12",  // Naranja
        lamaOrangeLight: "#F7B731", // Naranja claro
        lamaPink: "#E91E63",  // Rosa
        lamaPinkLight: "#F06292", // Rosa claro
        lamaGray: "#BDC3C7",  // Gris
        lamaGrayLight: "#D5DBDB",  // Gris claro
        lamaBrown: "#8E44AD",  // Marrón
        lamaBrownLight: "#9B59B6",  // Marrón claro
      },
    },
  },
  plugins: [],
};
export default config;
