export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        hospital: {
          50: '#f5fbff',
          100: '#e7f5fb',
          200: '#cfeef7',
          500: '#4db6d3',
          700: '#12677e',
          900: '#0b3440'
        }
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 76, 92, 0.10)'
      }
    }
  },
  plugins: []
}
