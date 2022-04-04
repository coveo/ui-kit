import {
  FoldedResultListSelectors,
  getAtomicResultAtIndex,
} from './result-list-selectors';
import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {
  addFoldedResultList,
  buildTemplateWithoutSections,
} from './result-list-actions';
import {
  makeChildComponents,
  withFoldedResult,
} from './folded-result-list-utils';

describe('Folded Result List Component', () => {
  it('should show child results', () => {
    new TestFixture()
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML('atomic-result-link'),
            makeChildComponents(),
          ])
        )
      )
      .withCustomFoldedResponse(withFoldedResult)
      .init();

    FoldedResultListSelectors.firstResult()
      .contains('Pyrenomycetes')
      .should('be.visible');

    getAtomicResultAtIndex(FoldedResultListSelectors, 0)
      .find('atomic-result-link')
      .contains('Stubble Lichens');
    getAtomicResultAtIndex(FoldedResultListSelectors, 1)
      .find('atomic-result-link')
      .contains('Opercs');
  });

  it('should show grandchild results', () => {
    new TestFixture()
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML('atomic-result-link'),
            makeChildComponents(makeChildComponents()),
          ])
        )
      )
      .withCustomFoldedResponse(withFoldedResult)
      .init();

    FoldedResultListSelectors.firstResult()
      .contains('Pyrenomycetes')
      .should('be.visible');

    getAtomicResultAtIndex(FoldedResultListSelectors, 0)
      .find('atomic-result-link')
      .contains('Stubble Lichens');
    getAtomicResultAtIndex(FoldedResultListSelectors, 1)
      .find('atomic-result-link')
      .contains('Opercs');

    getAtomicResultAtIndex(FoldedResultListSelectors, 1)
      .find('atomic-result-children')
      .shadow()
      .find('atomic-result')
      .shadow()
      .find('atomic-result-link')
      .contains('Elf Cups and Allies');
  });
});
