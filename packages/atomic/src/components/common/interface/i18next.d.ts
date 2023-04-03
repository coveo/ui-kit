import {Resources} from './i18n';
import type {
  defaultNS,
  fallbackLng,
  nsSeparator,
  compatibilityJSON,
} from './i18n';

interface _CustomTypeOptions {
  resources: Resources;
  defaultNs: typeof defaultNS;
  defaultLng: typeof fallbackLng;
  nsSeparator: typeof nsSeparator;
  jsonFormat: typeof compatibilityJSON;
}

type DoNotSuggestNamespaces<T> = Omit<T, 'nsSeparator'> & {
  nsSeparator: string;
};

declare module 'i18next' {
  interface CustomTypeOptions
    extends DoNotSuggestNamespaces<_CustomTypeOptions> {}

  type TemplateStringsArray = keyof Resources[typeof defaultNS];
}
