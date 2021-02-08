const isDevWatch = process.argv.indexOf('--dev') > -1;

module.exports = {
  purge: {
    content: [
      './src/**/*.tsx', './src/index.html', './src/**/*.css'
    ],
    enabled: !isDevWatch
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "primary": "var(--atomic-primary, #1372EC)",
        "primary-variant": "var(--atomic-primary-variant, #215CD3)",
        "on-primary": "var(--atomic-on-primary, #FFFFFF)",
        "secondary": "var(--atomic-secondary, #333357)",
        "secondary-variant": "var(--atomic-secondary-variant, #333357)",
        "on-secondary": "var(--atomic-on-secondary, #FFFFFF)",
        "background": "var(--atomic-background, #FFFFFF)",
        "background-variant": "var(--atomic-background-variant, #F6F7F9)",
        "on-background": "var(--atomic-on-background, #282829)",
        "on-background-variant": "var(--atomic-on-background-variant, #6b6b6b)",
        "divider": "var(--atomic-divider, #E5E8E8)",
        "error": "var(--atomic-error, #CE3F00)",
        "on-error": "var(--atomic-on-error, #FFFFFF)",
      }
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
    }),
    fontFamily: {
      "sans": "var(--atomic-font-family, Lato, Arial, Helvetica, sans-serif)"
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
