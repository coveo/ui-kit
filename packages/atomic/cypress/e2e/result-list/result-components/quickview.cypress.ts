import {generateComponentHTML} from '../../../fixtures/fixture-common';
import {TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addFacet} from '../../facets/facet/facet-actions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {quickviewComponent, QuickviewSelectors} from './quickview-selectors';

const addQuickviewInResultList = () =>
  addResultList(
    buildTemplateWithSections({
      actions: generateComponentHTML(quickviewComponent),
    })
  );

describe('Quickview Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(quickviewComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(QuickviewSelectors.shadow);
    CommonAssertions.assertConsoleError();
  });

  describe('when used on pdf file inside a result list', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field: 'filetype'}))
        .withHash('f-filetype=pdf')
        .with(addQuickviewInResultList())

        .init();
    });

    CommonAssertions.assertAccessibility(QuickviewSelectors.firstInResult);
    CommonAssertions.assertConsoleError(false);

    it('should open a modal on click', () => {
      QuickviewSelectors.button().click();
    });
  });
});
