import {InterceptAliases} from './search';

export const selectors = {
  result: 'c-quantic-result',
  searchbox: 'c-quantic-search-box input[type="search"]',
  summary: 'c-quantic-summary lightning-formatted-rich-text span',
  sort: 'c-quantic-sort',
  pager: 'c-quantic-pager',
  regularFacet: 'c-quantic-facet[data-cy="type"]',
};

export const setupAliases = () =>
  cy
    .intercept(
      'POST',
      'https://platform.cloud.coveo.com/rest/search/v2?organizationId=searchuisamples'
    )
    .as(InterceptAliases.Search.substring(1))
    .get(selectors.result, {timeout: 30000}); // Takes some time to load when server is cold

export const selectRegularFacetValue = (value: string) =>
  cy
    .get(selectors.regularFacet)
    .find(`c-quantic-facet-value[data-cy="${value}"] input[type="checkbox"]`)
    .check({force: true});

export const sortByDateDescending = () =>
  cy
    .get(selectors.sort)
    .find('lightning-combobox')
    .click()
    .get(selectors.sort)
    .find('div[role="listbox"]')
    .find('lightning-base-combobox-item[data-value="date descending"]')
    .trigger('mouseover', {force: true})
    .click();

export const selectResultPage = (pageNumber: number) =>
  cy.get(selectors.pager).find('button').contains(pageNumber).click();

export const searchFor = (text: string) =>
  searchboxType(text)?.then(searchboxTypeEnter);

const searchboxType = (text: string) => {
  if (!text) {
    return cy;
  }

  const head = text.substr(0, 1);
  const tail = text.substring(1);

  return cy
    .get(selectors.searchbox)
    .invoke('val')
    .then((currentText) => {
      const updatedText = currentText + head;
      cy.get(selectors.searchbox)
        .invoke('val', updatedText)
        .trigger('keyup', {which: head.charCodeAt(0)})
        .then(() => searchFor(tail));
    });
};

const searchboxTypeEnter = () =>
  cy.get(selectors.searchbox).then((searchbox) => {
    cy.wrap(searchbox).trigger('keyup', {key: 'Enter'});
  });
