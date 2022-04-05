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

  it('renders content before and after children only when there are children', () => {
    const components = makeChildComponents();

    const before = generateComponentHTML('p');
    before.slot = 'before-children';
    before.textContent = 'Before children!';
    components.insertAdjacentElement('afterbegin', before);

    const after = generateComponentHTML('p');
    after.slot = 'after-children';
    after.textContent = 'After children!';
    components.insertAdjacentElement('beforeend', after);

    new TestFixture()
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML('atomic-result-link'),
            components,
          ])
        )
      )
      .withCustomFoldedResponse(withFoldedResult)
      .init();

    FoldedResultListSelectors.firstResult()
      .find('atomic-result-children')
      .children()
      .eq(0)
      .contains('Before children!')
      .should('have.attr', 'slot', 'before-children');

    FoldedResultListSelectors.firstResult()
      .find('atomic-result-children')
      .shadow()
      .find('slot')
      .eq(0)
      .should('have.attr', 'name', 'before-children');

    FoldedResultListSelectors.firstResult()
      .find('atomic-result-children')
      .children()
      .eq(2)
      .contains('After children!')
      .should('have.attr', 'slot', 'after-children');

    FoldedResultListSelectors.firstResult()
      .find('atomic-result-children')
      .shadow()
      .find('slot')
      .eq(1)
      .should('have.attr', 'name', 'after-children');

    getAtomicResultAtIndex(FoldedResultListSelectors, 1)
      .find('atomic-result-children')
      .should('not.exist');
  });
});
