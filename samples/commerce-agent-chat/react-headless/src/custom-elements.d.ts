import type React from 'react';

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'cac-commerce-catalog-view': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      'cac-progress-trace': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      'atomock-search-results': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
