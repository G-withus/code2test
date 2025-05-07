/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        'primary': '#224CB7', //blue color
        construction: "#006FAF",
        hammer: "#00A6FF",
      },
      backgroundImage: {
        "secondary-gradient": "linear-gradient(to right, #224CB7, #5D31DA)",
      },//gradient color
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
      },
      screens: {
        xs: { max: "440px" }, // Applies styles when the screen is 440px or less
      },
      borderWidth: {
        0.5: "0.5px",
      },
      
    },
  },
  plugins: [],
}
