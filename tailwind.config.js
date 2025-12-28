/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 프로젝트에 맞는 커스텀 색상 추가 가능
      },
    },
  },
  plugins: [],
}
