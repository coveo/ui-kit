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
        "primary": "var(--background)",
        "on-primary": "var(--on-primary)",
        "secondary": "var(--on-secondary)",
        "background": "var(--background)",
        "on-background": "var(--on-background)",
        "error": "var(--error)",
        "on-error": "var(--on-error)",
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
