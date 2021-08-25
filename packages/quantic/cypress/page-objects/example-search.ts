export const setupAliases = () =>
  cy
    .intercept(
      'POST',
      'https://platform.cloud.coveo.com/rest/search/v2?organizationId=searchuisamples'
    )
    .as('search')
    .get('c-quantic-result', {timeout: 30000}) // Takes some time to load when server is cold
    .as('result')
    .get('c-quantic-search-box input[type="search"]')
    .as('searchbox')
    .get('c-quantic-summary lightning-formatted-rich-text span')
    .as('summary')
    .get('c-quantic-sort')
    .as('sort')
    .get('c-quantic-pager')
    .as('pager')
    .then(setupFacetTypeAliases);

const setupFacetTypeAliases = () =>
  cy
    .get('c-quantic-facet[data-cy="type"]')
    .as('facet-type')
    .get('@facet-type')
    .find('c-quantic-facet-value')
    .as('facet-type-values')
    .get('@facet-type')
    .find('button[data-cy="more"]')
    .as('facet-type-more')
    .get('@facet-type')
    .find('c-quantic-facet-value[data-cy="Item"] input[type="checkbox"]')
    .as('facet-type-item-checkbox');

export const sortByDateDescending = () =>
  cy
    .get('@sort')
    .find('input[role="textbox"]')
    .lwcDevClick()
    .get('@sort')
    .find('div[role="listbox"]')
    .find('lightning-base-combobox-item[role="option"]')
    .contains('Newest')
    .trigger('mouseover', {force: true})
    .lwcDevClick();

export const selectResultPage = (pageNumber: number) =>
  cy.get('@pager').find('lightning-button').contains(pageNumber).lwcDevClick();

export const searchFor = (text: string) =>
  searchboxType(text)?.then(searchboxTypeEnter);

const searchboxType = (text: string) => {
  if (!text) {
    return;
  }

  const head = text.substr(0, 1);
  const tail = text.substring(1);

  return cy
    .get('@searchbox')
    .invoke('val')
    .then((currentText) => {
      const updatedText = currentText + head;
      cy.get('@searchbox')
        .invoke('val', updatedText)
        .trigger('keyup', {which: head.charCodeAt(0)})
        .then(() => searchFor(tail));
    });
};

const searchboxTypeEnter = () =>
  cy.get('@searchbox').then((searchbox) => {
    cy.wrap(searchbox).trigger('keyup', {key: 'Enter'});
  });
