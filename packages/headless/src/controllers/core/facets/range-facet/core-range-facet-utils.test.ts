import {assertRangeFacetOptions} from './core-range-facet-utils.js';

describe('#assertRangeFacetOptions', () => {
  it('should not throw when generateAutomaticRanges is true, regardless of currentValues', () => {
    expect(() =>
      assertRangeFacetOptions(
        {
          generateAutomaticRanges: true,
        },
        'buildNumericFacet'
      )
    ).not.toThrow();

    expect(() =>
      assertRangeFacetOptions(
        {
          generateAutomaticRanges: true,
          currentValues: [],
        },
        'buildNumericFacet'
      )
    ).not.toThrow();
  });

  it('should not throw when generateAutomaticRanges is false and currentValues are provided', () => {
    expect(() =>
      assertRangeFacetOptions(
        {
          generateAutomaticRanges: false,
          currentValues: [1, 2, 3],
        },
        'buildNumericFacet'
      )
    ).not.toThrow();
  });

  it('should throw when generateAutomaticRanges is false and currentValues are undefined', () => {
    expect(() =>
      assertRangeFacetOptions(
        {
          generateAutomaticRanges: false,
        },
        'buildNumericFacet'
      )
    ).toThrow(
      'currentValues should be specified for buildNumericFacet when generateAutomaticRanges is false.'
    );
  });
});
