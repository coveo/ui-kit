import {Components} from '../../src/components';

export type SearchInterface = Components.AtomicSearchInterface;

export const searchInterfaceComponent = 'atomic-search-interface';

export function getSearchInterface(
  cb: (
    searchInterface: HTMLAtomicSearchInterfaceElement
  ) => void | Promise<void>
) {
  return cy.get(searchInterfaceComponent).then(($el) => {
    cy.wrap(cb($el.get(0) as HTMLAtomicSearchInterfaceElement));
  });
}

export function setInterfaceProp<K extends keyof SearchInterface>(
  prop: K,
  value: SearchInterface[K]
) {
  return getSearchInterface((searchInterface) => {
    (searchInterface as SearchInterface)[prop] = value;
  });
}

export function setLanguage(lang: string) {
  return setInterfaceProp('language', lang);
}

export function executeFirstSearch() {
  return getSearchInterface((searchInterface) => {
    searchInterface.executeFirstSearch();
  });
}
