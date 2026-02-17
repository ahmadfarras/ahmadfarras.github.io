/** @type {import('tailwindcss').Config}*/
const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"
  ],

  theme: {
    colors: {
      blue: "#1fb6ff",
      purple: "#7e5bef",
      pink: "#ff49db",
      orange: "#ff7849",
      green: "#13ce66",
      yellow: "#ffc82c",
      'gray-dark': "#273444",
      gray: "#8492a6",
      'gray-light': "#d3dce6"
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      serif: ["Merriweather", "serif"]
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF5F2",
          100: "#FFF1EE",
          200: "#FFE4DE",
          300: "#FFD5CC",
          400: "#FFBCAD",
          500: "#FE795D",
          600: "#EF562F",
          700: "#EB4F27",
          800: "#CC4522",
          900: "#A5371B"
        }
      },
      animation: {
        glide: 'glide 0.8s ease-out forwards',
        quickfadein: 'quickfadein 0.3s ease-out forwards',
      },
      keyframes: {
        glide: {
          '0%': { transform: 'translateX(-3%)' },
          '100%': { transform: 'translateX(0)' },
        },
        quickfadein: {
          '0%': { transform: 'scale(0.95)', opacity: 0.5 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
    }
  },

  plugins: [require("flowbite/plugin")],

  darkMode: "class"
};

module.exports = config;
