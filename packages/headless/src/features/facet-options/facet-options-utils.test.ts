import {isFacetIncludedOnTab} from './facet-options-utils.js';

describe('isFacetIncludedOnTab', () => {
  it('returns true when facetTabs or activeTab is undefined', () => {
    expect(isFacetIncludedOnTab(undefined, 'tab1')).toBe(true);
    expect(isFacetIncludedOnTab({excluded: ['tab2']}, undefined)).toBe(true);
    expect(isFacetIncludedOnTab(undefined, undefined)).toBe(true);
  });

  it('returns false when activeTab is in facetTabs.excluded', () => {
    const facetTabs = {excluded: ['tab2', 'tab3']};
    expect(isFacetIncludedOnTab(facetTabs, 'tab2')).toBe(false);
    expect(isFacetIncludedOnTab(facetTabs, 'tab3')).toBe(false);
  });

  it('returns true when facetTabs.included is empty or activeTab is in facetTabs.included', () => {
    const facetTabs = {included: []};
    expect(isFacetIncludedOnTab(facetTabs, 'tab1')).toBe(true);

    const facetTabsWithIncluded = {included: ['tab1', 'tab2']};
    expect(isFacetIncludedOnTab(facetTabsWithIncluded, 'tab1')).toBe(true);
    expect(isFacetIncludedOnTab(facetTabsWithIncluded, 'tab2')).toBe(true);
  });

  it('returns false when activeTab is not in facetTabs.included', () => {
    const facetTabs = {included: ['tab1', 'tab2']};
    expect(isFacetIncludedOnTab(facetTabs, 'tab3')).toBe(false);
  });

  it('returns false when activeTab is in facetTabs.excluded and included', () => {
    const facetTabs = {included: ['tab1'], excluded: ['tab1']};
    expect(isFacetIncludedOnTab(facetTabs, 'tab1')).toBe(false);
  });

  it('returns false when activeTab is not in facetTabs.included and not in excluded', () => {
    const facetTabs = {included: ['tab1'], excluded: ['tab2']};
    expect(isFacetIncludedOnTab(facetTabs, 'tab3')).toBe(false);
  });
});
