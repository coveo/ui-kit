import {FoldedResultListSelectors} from './folded-result-list-selectors';
import {resultLinkComponent} from './result-components/result-link-selectors';

export function assertRendersGrandchildren() {
  it('should render grandchildren', () => {
    FoldedResultListSelectors.firstResult()
      .contains('Pyrenomycetes')
      .should('be.visible');

    FoldedResultListSelectors.childResultAtIndex(0)
      .find(resultLinkComponent)
      .contains('Powdery Mildews');
    FoldedResultListSelectors.childResultAtIndex(1)
      .find(resultLinkComponent)
      .contains('common lichens');

    FoldedResultListSelectors.grandChildResultAtIndex(0, 1)
      .find(resultLinkComponent)
      .contains('Specklebelly Lichens');
  });
}

export function assertRendersWholeCollection() {
  it('should render whole collection', () => {
    FoldedResultListSelectors.childResult(0).should('have.length', 10);
    FoldedResultListSelectors.childResult(0)
      .eq(9)
      .shadow()
      .find(resultLinkComponent)
      .contains('lobster mushroom');
  });
}
