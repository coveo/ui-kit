import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {
  addFoldedResultList,
  buildTemplateWithoutSections,
  buildTemplateWithSections,
} from './result-list-actions';
import {
  buildLoadMoreChildren,
  buildResultChildren,
  buildResultTopChild,
} from './folded-result-list-actions';
import {
  FoldedResultListSelectors,
  beforeChildrenSlotName,
  afterChildrenSlotName,
  resultChildrenComponent,
} from './folded-result-list-selectors';
import {resultLinkComponent} from './result-components/result-link-selectors';
import {
  ExpectedHierarchy,
  assertRendersGrandchildren,
  assertRendersWholeCollection,
} from './folded-result-list-assertions';
import * as CommonAssertions from '../common-assertions';

const setSourceAndSortCriteria = () => {
  cy.intercept({method: 'POST', path: '**/rest/search/v2**'}, (request) => {
    request.body.aq = '@foldingcollection==("Pyrenomycetes")';
    request.body.sortCriteria = 'inat_sort_id ascending';
  });
};

describe('Folded Result List Component', () => {
  it('should show child results', () => {
    new TestFixture()
      .with(setSourceAndSortCriteria)
      .with(
        addFoldedResultList(buildTemplateWithoutSections(buildResultTopChild()))
      )
      .init();

    FoldedResultListSelectors.firstResult()
      .contains(ExpectedHierarchy.rootName)
      .should('be.visible');

    FoldedResultListSelectors.childResultAtIndex(0)
      .find(resultLinkComponent)
      .contains(ExpectedHierarchy.children[0].name);
    FoldedResultListSelectors.childResultAtIndex(1)
      .find(resultLinkComponent)
      .contains(ExpectedHierarchy.children[1].name);
  });

  it('renders content before and after children only when there are children', () => {
    const components = buildResultTopChild();

    const before = generateComponentHTML('p');
    before.slot = beforeChildrenSlotName;
    before.textContent = 'Before children!';
    components[1].insertAdjacentElement('afterbegin', before);

    const after = generateComponentHTML('p');
    after.slot = afterChildrenSlotName;
    after.textContent = 'After children!';
    components[1].insertAdjacentElement('beforeend', after);

    new TestFixture()
      .with(setSourceAndSortCriteria)
      .with(addFoldedResultList(buildTemplateWithoutSections(components)))
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

  describe('when grandchildren templates are specified', () => {
    beforeEach(() => {
      new TestFixture()
        .with(setSourceAndSortCriteria)
        .with(
          addFoldedResultList(
            buildTemplateWithoutSections(
              buildResultTopChild(buildResultChildren())
            )
          )
        )
        .init();
    });

    assertRendersGrandchildren();
  });

  describe('when result children component is set to inherit templates and no template is passed', () => {
    beforeEach(() => {
      const resultChildren = generateComponentHTML(resultChildrenComponent);
      resultChildren.setAttribute('inherit-templates', 'true');
      new TestFixture()
        .with(setSourceAndSortCriteria)
        .with(
          addFoldedResultList(
            buildTemplateWithSections({
              title: generateComponentHTML(resultLinkComponent),
              children: buildResultChildren(resultChildren),
            })
          )
        )
        .init();
    });

    assertRendersGrandchildren();
  });

  describe('should allow to load a folding collection', () => {
    function setupCollection() {
      const resultChildren = generateComponentHTML(resultChildrenComponent);
      resultChildren.setAttribute('inherit-templates', 'true');
      new TestFixture()
        .with(setSourceAndSortCriteria)
        .with(
          addFoldedResultList(
            buildTemplateWithoutSections(buildLoadMoreChildren())
          )
        )
        .init();

      FoldedResultListSelectors.loadMoreChildren().click();
      cy.wait(TestFixture.interceptAliases.UA);
    }

    before(() => {
      setupCollection();
    });

    assertRendersWholeCollection();

    describe('should restore initial results when collapsing collection', () => {
      before(() => {
        setupCollection();
        FoldedResultListSelectors.collapseButton().click();
        cy.wait(200);
      });

      assertRendersGrandchildren();
    });
  });

  describe('with an invalid configuration', () => {
    before(() => {
      new TestFixture()
        .with(setSourceAndSortCriteria)
        .with(
          addFoldedResultList(undefined, {
            'child-field': '',
            'collection-field': '',
          })
        )
        .init();
    });

    CommonAssertions.assertConsoleError();
    CommonAssertions.assertContainsComponentError(
      FoldedResultListSelectors,
      true
    );
  });
});
