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
        "darker-blue": "var(--darker-blue)",
        "dark-blue": "var(--dark-blue)",
        "medium-blue": "var(--medium-blue)",
        "light-blue": "var(--light-blue)",
        "dark-grey": "var(--dark-grey)",
        "dark-medium-grey": "var(--dark-medium-grey)",
        "medium-grey": "var(--medium-grey)",
        "light-medium-grey": "var(--light-medium-grey)",
        "light-grey": "var(--light-grey)",
        "white": "var(--white)",
        "light": "var(--light)",
        "pure-white": "var(--pure-white)",
        "orange": "var(--orange)",
        "stratos": "var(--stratos)",
        "purple-blue": "var(--purple-blue)",
      },
      height: {
        input: "var(--input-height)"
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
