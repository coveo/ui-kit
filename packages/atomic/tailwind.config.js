/* eslint-disable @cspell/spellchecker */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      variants: {
        textColor: ['group-hover'],
        fill: ['hover', 'group-hover', 'responsive'],
        visibility: ['group-hover', 'responsive'],
      },
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
        disabled: 'var(--atomic-disabled)',
      },
      borderRadius: {
        DEFAULT: 'var(--atomic-border-radius)',
        md: 'var(--atomic-border-radius-md)',
        lg: 'var(--atomic-border-radius-lg)',
        xl: 'var(--atomic-border-radius-xl)',
      },
      boxShadow: {
        'inner-primary': 'inset 0 0 0 1px var(--atomic-primary)',
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
      gradientColorStops: (theme) => ({
        ...theme('colors'),
        'background-60': 'var(--atomic-background) 60%',
      }),
      gridTemplateColumns: {
        'min-1fr': 'min-content 1fr',
      },
      zIndex: {
        1: '1',
      },
      animation: {
        scaleUpModal:
          'scaleUp .5s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards',
        slideDownModal: 'slideDown .5s linear forwards',
      },
      transitionProperty: {
        'visi-opacity': 'visibility, opacity',
      },
      keyframes: {
        scaleUp: {
          '0%': {transform: 'scale(0.7) translateY(150vh)', opacity: '0.7'},
          '100%': {transform: 'scale(1) translateY(0px)', opacity: '1'},
        },
        slideDown: {
          '0%': {transform: 'translateY(0px)', opacity: '1'},
          '100%': {transform: 'translateY(150vh)', opacity: '0.7'},
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
  plugins: [
    plugin(function ({addUtilities, theme, variants}) {
      addUtilities(
        {
          '.outline-color': {
            outlineColor: theme('colors.primary-light'),
          },
        },
        variants('outlineColor')
      );
    }),
  ],
};
