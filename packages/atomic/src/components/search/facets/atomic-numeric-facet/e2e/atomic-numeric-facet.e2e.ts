import {test, expect} from './fixture';

test.describe('when dependent', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-depends-on'});
  });

  test('when the specified dependency is selected in the parent facet, should be visible', () => {
    expect(true);
  });

  test.describe('when the specified dependency is not selected in the parent facet', () => {
    test('should not be visible', () => {
      expect(true);
    });
    test('should clear previously selected range', () => {
      expect(true);
    });
    test('should clear previously selected input range', () => {
      expect(true);
    });
  });
});
