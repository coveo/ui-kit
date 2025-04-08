import {NumericFacetValue, SearchStatusState} from '@coveo/headless';
import {shouldDisplayInputForFacetRange} from './stencil-facet-common';

describe('facet common', () => {
  describe('shouldDisplayInputForFacetRange', () => {
    it('should #display=false when there is no input', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: false,
          hasInputRange: false,
          searchStatusState: {hasResults: true} as SearchStatusState,
          facetValues: [{}, {}] as NumericFacetValue[],
        })
      ).toBe(false);
    });

    it('should #display=true when there is an input range but no results', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: true,
          hasInputRange: true,
          searchStatusState: {hasResults: false} as SearchStatusState,
          facetValues: [] as NumericFacetValue[],
        })
      ).toBe(true);
    });

    it('should #display=false there is no results', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: true,
          hasInputRange: false,
          searchStatusState: {hasResults: false} as SearchStatusState,
          facetValues: [] as NumericFacetValue[],
        })
      ).toBe(false);
    });

    it('should #display=false there is no values to render', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: true,
          hasInputRange: false,
          searchStatusState: {hasResults: true} as SearchStatusState,
          facetValues: [] as NumericFacetValue[],
        })
      ).toBe(false);
    });

    it('should #display=true there is values to render', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: true,
          hasInputRange: false,
          searchStatusState: {hasResults: true} as SearchStatusState,
          facetValues: [{}, {}] as NumericFacetValue[],
        })
      ).toBe(true);
    });
  });
});
