import {FoldedResultListSelectors} from './folded-result-list-selectors';
import {resultLinkComponent} from './result-components/result-link-selectors';

// cSpell:ignore Opercs

export const ExpectedHierarchy = {
  rootName: 'Pyrenomycetes',
  children: [
    {name: 'lobster mushroom'},
    {name: 'common lichens', children: [{name: 'bushy lichens'}]},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {name: 'Opercs', children: [{}, {}, {}, {name: 'Elfin Saddles'}]},
  ] as const,
};
export const ExpectedHierarchyWith10foldedResultsRequested = {
  rootName: 'Pyrenomycetes',
  children: [
    {name: 'lobster mushroom'},
    {name: 'Purple Jellydisc'},
    {name: 'common lichens', children: [{name: 'bushy lichens'}]},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {name: 'Opercs', children: [{}, {}, {}, {name: 'Elfin Saddles'}]},
  ] as const,
};

export function assertRendersGrandchildren() {
  it('should render grandchildren', () => {
    FoldedResultListSelectors.firstResult()
      .find('atomic-text')
      .should('be.visible')
      .shadow()
      .should('contain.text', ExpectedHierarchy.rootName);

    FoldedResultListSelectors.childResultAtIndex(0)
      .find(resultLinkComponent)
      .find('atomic-text')
      .shadow()
      .should('contain.text', ExpectedHierarchy.children[0].name);
    FoldedResultListSelectors.childResultAtIndex(1)
      .find(resultLinkComponent)
      .find('atomic-text')
      .shadow()
      .should('contain.text', ExpectedHierarchy.children[1].name);

    FoldedResultListSelectors.grandChildResultAtIndex(0, 1)
      .find(resultLinkComponent)
      .find('atomic-text')
      .shadow()
      .should('contain.text', ExpectedHierarchy.children[1].children[0].name);
  });
}

export function assertRendersWholeCollection() {
  it('should render whole collection', () => {
    FoldedResultListSelectors.childResult(0).should('have.length', 10);
    FoldedResultListSelectors.childResult(0)
      .eq(9)
      .shadow()
      .find(resultLinkComponent)
      .find('atomic-text')
      .shadow()
      .should('contain.text', ExpectedHierarchy.children[9].name);
    FoldedResultListSelectors.grandChildResultAtIndex(3, 9)
      .find(resultLinkComponent)
      .find('atomic-text')
      .shadow()
      .should('contain.text', ExpectedHierarchy.children[9].children[3].name);
  });
}
