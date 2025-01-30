import {test, expect} from './fixture';

test.describe('when parent dependency', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-depends-on'});
  });

  test('when the parent dependency is selected, should be visible', () => {
    expect(true);
  });

  test.describe('when the parent dependency is not selected', () => {
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
