import {generateComponentHTML} from '../../../fixtures/fixture-common';
import {TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {quickviewComponent, QuickviewSelectors} from './quickview-selectors';

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
});
