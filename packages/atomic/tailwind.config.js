const plugin = require('tailwindcss/plugin');
const isDevWatch = process.argv.indexOf('--dev') > -1;

module.exports = {
  mode: 'jit', // Still some issues for reloading styles with jit mode https://github.com/ionic-team/stencil-postcss/pull/35
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
        'ring-primary': 'var(--atomic-ring-primary)',
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
        md: 'var(--atomic-border-radius-md)',
        lg: 'var(--atomic-border-radius-lg)',
        xl: 'var(--atomic-border-radius-xl)',
      },
      fontWeight: {
        normal: 'var(--atomic-font-normal)',
        bold: 'var(--atomic-font-bold)',
      },
      fontSize: {
        sm: 'var(--atomic-text-sm)',
        base: 'var(--atomic-text-base)',
        lg: 'var(--atomic-text-lg)',
        xl: 'var(--atomic-text-xl)',
        '2xl': 'var(--atomic-text-2xl)',
      },
      screens: {
        'desktop-only': {min: '1024px'},
        'mobile-only': {raw: 'not all and (min-width: 1024px)'},
      },
      gridTemplateColumns: {
        'min-1fr': 'min-content 1fr',
      },
      zIndex: {
        1: '1',
      },
      animation: {
        scaleUpRefineModal:
          'scaleUp .5s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards',
        scaleDownRefineModal:
          'scaleDown .5s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards',
      },
      keyframes: {
        scaleUp: {
          '0%': {transform: 'scale(0.7) translateY(1000px)', opacity: '0.7'},
          '100%': {transform: 'scale(1) translateY(0px)', opacity: '1'},
        },
        scaleDown: {
          '0%': {transform: 'scale(1) translateY(0px)', opacity: '1'},
          '100%': {transform: 'scale(0.7) translateY(1000px)', opacity: '0.7'},
        },
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
      textColor: ['visited', 'group-focus', 'disabled', 'focus-visible'],
      borderColor: ['disabled', 'focus-visible'],
      cursor: ['disabled'],
      borderWidth: ['focus-visible'],
      backgroundColor: ['group-focus', 'focus-visible'],
      borderRadius: ['first', 'last'],
      textDecoration: ['focus-visible'],
      ringColor: ['focus-visible'],
      ringWidth: ['focus-visible'],
      outline: ['focus-visible'],
    },
  },
  plugins: [
    plugin(function ({addUtilities, theme}) {
      addUtilities(
        {
          '.outline-color': {
            outlineColor: theme('colors.primary-light'),
          },
        },
        {variants: ['focus']}
      );
    }),
  ],
};
