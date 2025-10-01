
import { AtomicSearchInterface } from '../../src/components/search/atomic-search-interface/atomic-search-interface';

export type SearchInterface = AtomicSearchInterface;

export const searchInterfaceComponent = 'atomic-search-interface';

export function getSearchInterface(
  cb: (
    searchInterface: AtomicSearchInterface
  ) => void | Promise<void>
) {
  return cy.get(searchInterfaceComponent).then(($el) => {
    cy.wrap(cb($el.get(0) as AtomicSearchInterface));
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
