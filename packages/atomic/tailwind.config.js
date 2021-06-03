const isDevWatch = process.argv.indexOf('--dev') > -1;

module.exports = {
  purge: {
    content: ['./src/**/*.tsx', './src/**/*.css'],
    enabled: !isDevWatch,
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // Primary
        primary: 'var(--atomic-primary)',
        'primary-light': 'var(--atomic-primary-light)',
        'primary-dark': 'var(--atomic-primary-dark)',
        'on-primary': 'var(--atomic-on-primary)',
        // Secondary
        secondary: 'var(--atomic-secondary)',
        'secondary-light': 'var(--atomic-secondary-light)',
        'secondary-dark': 'var(--atomic-secondary-dark)',
        'on-secondary': 'var(--atomic-on-secondary)',
        // Neutral
        neutral: 'var(--atomic-neutral)',
        'neutral-light': 'var(--atomic-neutral-light)',
        'neutral-dark': 'var(--atomic-neutral-dark)',
        // Semantic
        background: 'var(--atomic-background)',
        'on-background': 'var(--atomic-on-background)',
        success: 'var(--atomic-success)',
        error: 'var(--atomic-error)',
      },
      borderRadius: {
        DEFAULT: 'var(--atomic-border-radius)',
        lg: 'var(--atomic-border-radius-lg)',
      },
      fontWeight: {
        normal: 'var(--atomic-font-normal)',
        bold: 'var(--atomic-font-bold)',
      },
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
    }),
    fontFamily: {
      sans: `var(--atomic-font-family)`,
    },
  },
  variants: {
    extend: {
      textColor: ['visited'],
    },
  },
  plugins: [],
};
