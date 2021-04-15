const isDevWatch = process.argv.indexOf('--dev') > -1;

module.exports = {
  purge: {
    content: [
      './src/**/*.tsx', './src/**/*.css'
    ],
    enabled: !isDevWatch
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "primary": "var(--atomic-primary)",
        "primary-variant": "var(--atomic-primary-variant)",
        "on-primary": "var(--atomic-on-primary)",
        "secondary": "var(--atomic-secondary)",
        "secondary-variant": "var(--atomic-secondary-variant)",
        "on-secondary": "var(--atomic-on-secondary)",
        "background": "var(--atomic-background)",
        "background-variant": "var(--atomic-background-variant)",
        "on-background": "var(--atomic-on-background)",
        "on-background-variant": "var(--atomic-on-background-variant)",
        "divider": "var(--atomic-divider)",
        "error": "var(--atomic-error)",
        "on-error": "var(--atomic-on-error)",
        "visited": "var(--atomic-visited)",
      },
      borderRadius: {
        "sm": "var(--atomic-border-radius-sm)",
        "DEFAULT": "var(--atomic-border-radius)",
        "md": "var(--atomic-border-radius-md)",
        "lg": "var(--atomic-border-radius-lg)",
        "xl": "var(--atomic-border-radius-xl)",
        "full": "var(--atomic-border-radius-full)",
      }
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
    }),
    fontFamily: {
      "sans": "var(--atomic-font-family)"
    }
  },
  variants: {
    extend: {
      textColor: ['visited'],
    },
  },
  plugins: [],
}
