import {FoldedResultListSelectors} from './folded-result-list-selectors';
import {resultLinkComponent} from './result-components/result-link-selectors';

export function assertRendersGrandchildren() {
  it('should render grandchildren', () => {
    FoldedResultListSelectors.firstResult()
      .contains('Pyrenomycetes')
      .should('be.visible');

    FoldedResultListSelectors.childResultAtIndex(0)
      .find(resultLinkComponent)
      .contains('Stubble Lichens');
    FoldedResultListSelectors.childResultAtIndex(1)
      .find(resultLinkComponent)
      .contains('Opercs');

    FoldedResultListSelectors.grandChildResultAtIndex(0, 1)
      .find(resultLinkComponent)
      .contains('Elf Cups and Allies');
  });
}
