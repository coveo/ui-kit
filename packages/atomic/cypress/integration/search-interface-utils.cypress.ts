import {i18n} from 'i18next';

export type SearchInterface = HTMLElement & {
  language: string;
  i18n: i18n;
  executeFirstSearch: () => void;
};

export function getSearchInterface(
  cb: (searchInterface: SearchInterface) => void
) {
  return cy.get('atomic-search-interface').then(($el) => {
    cb($el.get(0) as SearchInterface);
  });
}

export function setLanguage(lang: string) {
  return getSearchInterface((searchInterface) => {
    searchInterface.language = lang;
  });
}

export function executeFirstSearch() {
  return getSearchInterface((searchInterface) => {
    searchInterface.executeFirstSearch();
  });
}

export function setFieldCaptions(
  field: string,
  captions: Record<string, string>
) {
  getSearchInterface((searchInterface) => {
    searchInterface.i18n.addResourceBundle('en', `caption-${field}`, captions);
  });
}
