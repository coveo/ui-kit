module.exports = {
  purge: {
    content: [
      './src/**/*.tsx', './src/index.html', './src/**/*.css'
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)"
      }
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
    }),
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
