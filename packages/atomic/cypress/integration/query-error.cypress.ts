import {TestFixture} from '../fixtures/test-fixture';
import {addQueryError} from './query-error-actions';
import {QueryErrorSelectors} from './query-error-selectors';
import * as CommonAssertions from './common-assertions';

describe('Query Error Test Suites', () => {
  describe("when there's an error", () => {
    beforeEach(() => {
      new TestFixture().with(addQueryError()).withError().init();
    });

    CommonAssertions.assertAriaLiveMessage(
      QueryErrorSelectors.liveRegion,
      'wrong'
    );
  });
});
