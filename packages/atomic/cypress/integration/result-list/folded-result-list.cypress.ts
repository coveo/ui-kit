import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {
  addFoldedResultList,
  buildTemplateWithoutSections,
} from './result-list-actions';
import {makeChildComponents} from './folded-result-list-utils';
import {
  FoldedResultListSelectors,
  getAtomicResultChildren,
  getAtomicChildResultAtIndex,
  getAtomicGrandChildResultAtIndex,
} from './folded-result-list-selectors';

const setSource = () => {
  cy.intercept({method: 'POST', path: '**/rest/search/v2**'}, (request) => {
    request.body.aq = '@source==("iNaturalistTaxons")';
  });
};

describe('Folded Result List Component', () => {
  it('should show child results', () => {
    new TestFixture()
      .with(setSource)
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML('atomic-result-link'),
            makeChildComponents(),
          ])
        )
      )
      .init();

    FoldedResultListSelectors.firstResult()
      .contains('Pyrenomycetes')
      .should('be.visible');

    getAtomicChildResultAtIndex(0)
      .find('atomic-result-link')
      .contains('Stubble Lichens');
    getAtomicChildResultAtIndex(1)
      .find('atomic-result-link')
      .contains('Opercs');
  });

  it('should show grandchild results', () => {
    new TestFixture()
      .with(setSource)
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML('atomic-result-link'),
            makeChildComponents(makeChildComponents()),
          ])
        )
      )
      .init();

    FoldedResultListSelectors.firstResult()
      .contains('Pyrenomycetes')
      .should('be.visible');

    getAtomicChildResultAtIndex(0)
      .find('atomic-result-link')
      .contains('Stubble Lichens');
    getAtomicChildResultAtIndex(1)
      .find('atomic-result-link')
      .contains('Opercs');

    getAtomicGrandChildResultAtIndex(0, 1)
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
      .with(setSource)
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML('atomic-result-link'),
            components,
          ])
        )
      )
      .init();

    getAtomicResultChildren()
      .children()
      .eq(0)
      .contains('Before children!')
      .should('have.attr', 'slot', 'before-children');

    getAtomicResultChildren()
      .shadow()
      .find('slot')
      .eq(0)
      .should('have.attr', 'name', 'before-children');

    getAtomicResultChildren()
      .children()
      .eq(2)
      .contains('After children!')
      .should('have.attr', 'slot', 'after-children');

    getAtomicResultChildren()
      .shadow()
      .find('slot')
      .eq(1)
      .should('have.attr', 'name', 'after-children');

    getAtomicChildResultAtIndex(1)
      .find('atomic-result-children')
      .should('not.exist');
  });
});
