import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {
  addFoldedResultList,
  buildTemplateWithoutSections,
} from './result-list-actions';
import {buildResultChildren} from './folded-result-list-actions';
import {
  FoldedResultListSelectors,
  beforeChildrenSlotName,
  afterChildrenSlotName,
  resultChildrenComponent,
} from './folded-result-list-selectors';
import {resultLinkComponent} from './result-components/result-link-selectors';

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
            generateComponentHTML(resultLinkComponent),
            buildResultChildren(),
          ])
        )
      )
      .init();

    FoldedResultListSelectors.firstResult()
      .contains('Pyrenomycetes')
      .should('be.visible');

    FoldedResultListSelectors.childResultAtIndex(0)
      .find(resultLinkComponent)
      .contains('Stubble Lichens');
    FoldedResultListSelectors.childResultAtIndex(1)
      .find(resultLinkComponent)
      .contains('Opercs');
  });

  it('should show grandchild results', () => {
    new TestFixture()
      .with(setSource)
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML(resultLinkComponent),
            buildResultChildren(buildResultChildren()),
          ])
        )
      )
      .init();

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

  it('renders content before and after children only when there are children', () => {
    const components = buildResultChildren();

    const before = generateComponentHTML('p');
    before.slot = beforeChildrenSlotName;
    before.textContent = 'Before children!';
    components.insertAdjacentElement('afterbegin', before);

    const after = generateComponentHTML('p');
    after.slot = afterChildrenSlotName;
    after.textContent = 'After children!';
    components.insertAdjacentElement('beforeend', after);

    new TestFixture()
      .with(setSource)
      .with(
        addFoldedResultList(
          buildTemplateWithoutSections([
            generateComponentHTML(resultLinkComponent),
            components,
          ])
        )
      )
      .init();

    FoldedResultListSelectors.resultChildren()
      .children()
      .eq(0)
      .contains('Before children!')
      .should('have.attr', 'slot', beforeChildrenSlotName);

    FoldedResultListSelectors.resultChildren()
      .shadow()
      .find('slot')
      .eq(0)
      .should('have.attr', 'name', beforeChildrenSlotName);

    FoldedResultListSelectors.resultChildren()
      .children()
      .eq(2)
      .contains('After children!')
      .should('have.attr', 'slot', afterChildrenSlotName);

    FoldedResultListSelectors.resultChildren()
      .shadow()
      .find('slot')
      .eq(1)
      .should('have.attr', 'name', afterChildrenSlotName);

    FoldedResultListSelectors.childResultAtIndex(1)
      .find(resultChildrenComponent)
      .should('not.exist');
  });
});
