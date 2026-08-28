import type {NumericFacetValue, SearchStatusState} from '@coveo/headless';
import {describe, expect, it} from 'vitest';
import {
  collapseFacetsAfter,
  getAutomaticFacetGenerator,
  getFacetElementToReorder,
  getFacetsInChildren,
  getFirstNewFacetValueIndex,
  isAutomaticFacetGenerator,
  isFacetNestedInPopover,
  shouldDisplayInputForFacetRange,
  sortFacetVisibility,
  triageFacetsByParents,
} from './facet-common';

type TestFacet = HTMLElement & {facetId: string; isCollapsed: boolean};

describe('facet-common', () => {
  const buildMockFacetElement = (props: {facetId?: string; isCollapsed?: boolean}): TestFacet => {
    const visibleFacet = document.createElement('div') as unknown as TestFacet;
    visibleFacet.facetId = props.facetId || 'default-facet-id';
    visibleFacet.isCollapsed = props.isCollapsed || false;
    return visibleFacet;
  };

  describe('#getFirstNewFacetValueIndex', () => {
    it('returns the first new value index after values are reordered', () => {
      const values = [{value: 'April'}, {value: 'December'}, {value: 'August'}];

      expect(getFirstNewFacetValueIndex(values, new Set(['April', 'August']))).toBe(1);
    });

    it('returns -1 when there are no new values', () => {
      const values = [{value: 'April'}, {value: 'August'}];

      expect(getFirstNewFacetValueIndex(values, new Set(['April', 'August']))).toBe(-1);
    });
  });

  describe('#shouldDisplayInputForFacetRange', () => {
    it('should return false when there is no input', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: false,
          hasInputRange: false,
          searchStatusState: {hasResults: true} as SearchStatusState,
          facetValues: [{}, {}] as NumericFacetValue[],
        })
      ).toBe(false);
    });

    it('should return true when there is an input range but no results', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: true,
          hasInputRange: true,
          searchStatusState: {hasResults: false} as SearchStatusState,
          facetValues: [] as NumericFacetValue[],
        })
      ).toBe(true);
    });

    it('should return false when there are no results', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: true,
          hasInputRange: false,
          searchStatusState: {hasResults: false} as SearchStatusState,
          facetValues: [] as NumericFacetValue[],
        })
      ).toBe(false);
    });

    it('should return false when there are no values to render', () => {
      expect(
        shouldDisplayInputForFacetRange({
          hasInput: true,
          hasInputRange: false,
          searchStatusState: {hasResults: true} as SearchStatusState,
          facetValues: [] as NumericFacetValue[],
        })
      ).toBe(false);
    });

    it('should return true when there are values to render', () => {
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

  describe('#sortFacetVisibility', () => {
    it('should separate visible and invisible facets based on isHidden', () => {
      const visibleFacet = buildMockFacetElement({
        facetId: '1',
        isCollapsed: false,
      });
      const invisibleFacet = buildMockFacetElement({
        facetId: '2',
        isCollapsed: false,
      });
      const facetInfoMap = {
        '1': {isHidden: () => false},
        '2': {isHidden: () => true},
      };
      const {visibleFacets, invisibleFacets} = sortFacetVisibility(
        [visibleFacet, invisibleFacet],
        facetInfoMap
      );
      expect(visibleFacets).toContain(visibleFacet);
      expect(invisibleFacets).toContain(invisibleFacet);
    });
  });

  describe('#collapseFacetsAfter', () => {
    it('should collapse facets after the visibleFacetsCount', () => {
      const facets: TestFacet[] = [
        buildMockFacetElement({isCollapsed: false}),
        buildMockFacetElement({isCollapsed: false}),
        buildMockFacetElement({isCollapsed: false}),
      ];
      collapseFacetsAfter(facets, 2);
      expect(facets[0].isCollapsed).toBe(false);
      expect(facets[1].isCollapsed).toBe(false);
      expect(facets[2].isCollapsed).toBe(true);
    });

    it('should not collapse any facets if visibleFacetsCount is -1', () => {
      const facets: TestFacet[] = [
        buildMockFacetElement({isCollapsed: false}),
        buildMockFacetElement({isCollapsed: false}),
      ];
      collapseFacetsAfter(facets, -1);
      expect(facets[0].isCollapsed).toBe(false);
      expect(facets[1].isCollapsed).toBe(false);
    });
  });

  describe('#isAutomaticFacetGenerator', () => {
    it('should return true for ATOMIC-AUTOMATIC-FACET-GENERATOR tag', () => {
      const el = document.createElement('atomic-automatic-facet-generator');
      expect(isAutomaticFacetGenerator(el)).toBe(true);
    });

    it('should return false for other tags', () => {
      const el = document.createElement('div');
      expect(isAutomaticFacetGenerator(el)).toBe(false);
    });
  });

  describe('#getFacetsInChildren', () => {
    it('should return only children with facetId', () => {
      const parent = document.createElement('div');
      const facet1 = buildMockFacetElement({facetId: 'f1'});
      const facet2 = buildMockFacetElement({facetId: 'f2'});
      const notFacet = document.createElement('div');

      parent.appendChild(facet1);
      parent.appendChild(facet2);
      parent.appendChild(notFacet);

      const result = getFacetsInChildren(parent);

      expect(result).toContain(facet1);
      expect(result).toContain(facet2);
      expect(result).not.toContain(notFacet);
    });

    it('should return facets nested inside a popover', () => {
      const parent = document.createElement('div');
      const facet = buildMockFacetElement({facetId: 'f1'});
      const popover = document.createElement('atomic-popover');
      popover.appendChild(facet);
      parent.appendChild(popover);

      expect(getFacetsInChildren(parent)).toEqual([facet]);
    });

    it('should preserve the DOM order of facets when some are nested inside a popover', () => {
      const parent = document.createElement('div');
      const facet1 = buildMockFacetElement({facetId: 'f1'});
      const facet2 = buildMockFacetElement({facetId: 'f2'});
      const popover = document.createElement('atomic-popover');
      popover.appendChild(facet2);

      parent.appendChild(facet1);
      parent.appendChild(popover);

      expect(getFacetsInChildren(parent)).toEqual([facet1, facet2]);
    });

    it('should not return the content of a popover without a facet', () => {
      const parent = document.createElement('div');
      const popover = document.createElement('atomic-popover');
      popover.appendChild(document.createElement('div'));
      parent.appendChild(popover);

      expect(getFacetsInChildren(parent)).toEqual([]);
    });
  });

  describe('#isFacetNestedInPopover', () => {
    it('should return true when the facet is slotted in a popover', () => {
      const popover = document.createElement('atomic-popover');
      const facet = buildMockFacetElement({facetId: 'f1'});
      popover.appendChild(facet);

      expect(isFacetNestedInPopover(facet)).toBe(true);
    });

    it('should return false when the facet is not slotted in a popover', () => {
      const parent = document.createElement('div');
      const facet = buildMockFacetElement({facetId: 'f1'});
      parent.appendChild(facet);

      expect(isFacetNestedInPopover(facet)).toBe(false);
    });
  });

  describe('#getFacetElementToReorder', () => {
    it('should return the popover when the facet is slotted in one', () => {
      const popover = document.createElement('atomic-popover');
      const facet = buildMockFacetElement({facetId: 'f1'});
      popover.appendChild(facet);

      expect(getFacetElementToReorder(facet)).toBe(popover);
    });

    it('should return the facet itself when it is not slotted in a popover', () => {
      const facet = buildMockFacetElement({facetId: 'f1'});

      expect(getFacetElementToReorder(facet)).toBe(facet);
    });
  });

  describe('#getAutomaticFacetGenerator', () => {
    it('should return the automatic facet generator child if present', () => {
      const parent = document.createElement('div');
      const autoGen = document.createElement('atomic-automatic-facet-generator');
      parent.appendChild(autoGen);
      expect(getAutomaticFacetGenerator(parent)).toBe(autoGen);
    });

    it('should return undefined if not present', () => {
      const parent = document.createElement('div');
      expect(getAutomaticFacetGenerator(parent)).toBeUndefined();
    });
  });

  describe('#triageFacetsByParents', () => {
    it('should group facets by their parent', () => {
      const parent1 = document.createElement('div');
      const parent2 = document.createElement('div');
      const facet1 = buildMockFacetElement({facetId: 'f1'});
      const facet2 = buildMockFacetElement({facetId: 'f2'});

      parent1.appendChild(facet1);
      parent2.appendChild(facet2);

      const result = triageFacetsByParents([facet1, facet2], parent1, parent2);

      expect(result.get(parent1)).toContain(facet1);
      expect(result.get(parent2)).toContain(facet2);
    });

    it('should put facets with no parent in the null group', () => {
      const parent1 = document.createElement('div');
      const facet1 = buildMockFacetElement({facetId: 'f1'});
      const facet2 = buildMockFacetElement({facetId: 'f2'});

      parent1.appendChild(facet1);
      const result = triageFacetsByParents([facet1, facet2], parent1);

      expect(result.get(parent1)).not.toContain(facet2);
      expect(result.get(null)).toContain(facet2);
    });
  });
});
