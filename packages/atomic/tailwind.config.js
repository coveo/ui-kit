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
        // Neutral
        neutral: 'var(--atomic-neutral)',
        'neutral-light': 'var(--atomic-neutral-light)',
        'neutral-dark': 'var(--atomic-neutral-dark)',
        // Semantic
        background: 'var(--atomic-background)',
        'on-background': 'var(--atomic-on-background)',
        success: 'var(--atomic-success)',
        error: 'var(--atomic-error)',
        visited: 'var(--atomic-visited)',
      },
      borderRadius: {
        DEFAULT: 'var(--atomic-border-radius)',
        lg: 'var(--atomic-border-radius-lg)',
      },
      fontWeight: {
        normal: 'var(--atomic-font-normal)',
        bold: 'var(--atomic-font-bold)',
      },
      fontSize: {
        sm: 'var(--atomic-text-sm)',
        base: 'var(--atomic-text-base)',
        lg: 'var(--atomic-text-lg)',
      }
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
