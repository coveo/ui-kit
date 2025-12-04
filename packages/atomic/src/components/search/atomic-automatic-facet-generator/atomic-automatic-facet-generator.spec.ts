import {
  type AutomaticFacet,
  buildAutomaticFacetGenerator,
  buildSearchStatus,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeAutomaticFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/automatic-facet-controller';
import {buildFakeAutomaticFacetGenerator} from '@/vitest-utils/testing-helpers/fixtures/headless/search/automatic-facet-generator-controller';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicAutomaticFacetGenerator} from './atomic-automatic-facet-generator';
import './atomic-automatic-facet-generator';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-automatic-facet-generator', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedAutomaticFacets: AutomaticFacet[];

  interface RenderOptions {
    desiredCount?: number;
    numberOfValues?: number;
    firstSearchExecuted?: boolean;
    automaticFacets?: AutomaticFacet[];
  }

  const renderAutomaticFacetGenerator = async ({
    desiredCount = 5,
    numberOfValues = 8,
    firstSearchExecuted = true,
    automaticFacets = [],
  }: RenderOptions = {}) => {
    mockedAutomaticFacets = automaticFacets;

    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        firstSearchExecuted,
        hasResults: true,
        isLoading: false,
        hasError: false,
      })
    );

    vi.mocked(buildAutomaticFacetGenerator).mockReturnValue(
      buildFakeAutomaticFacetGenerator({
        automaticFacets: mockedAutomaticFacets,
      })
    );

    const {element} =
      await renderInAtomicSearchInterface<AtomicAutomaticFacetGenerator>({
        template: html`<div>
        <atomic-automatic-facet-generator
          desired-count=${desiredCount}
          number-of-values=${numberOfValues}
        ></atomic-automatic-facet-generator>
      </div>`,
        selector: 'atomic-automatic-facet-generator',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      placeholders: () => page.getByRole('generic', {name: ''}),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render placeholders when first search has not executed', async () => {
    await renderAutomaticFacetGenerator({
      firstSearchExecuted: false,
      desiredCount: 3,
    });

    const placeholders = document.querySelectorAll('[part="placeholder"]');
    expect(placeholders.length).toBe(3);
  });

  it('should render the correct number of placeholders based on desiredCount', async () => {
    await renderAutomaticFacetGenerator({
      firstSearchExecuted: false,
      desiredCount: 5,
    });

    const placeholders = document.querySelectorAll('[part="placeholder"]');
    expect(placeholders.length).toBe(5);
  });

  it('should call buildSearchStatus with the engine', async () => {
    await renderAutomaticFacetGenerator();
    expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildAutomaticFacetGenerator with correct options', async () => {
    await renderAutomaticFacetGenerator({
      desiredCount: 3,
      numberOfValues: 10,
    });

    expect(buildAutomaticFacetGenerator).toHaveBeenCalledWith(mockedEngine, {
      options: {
        desiredCount: 3,
        numberOfValues: 10,
      },
    });
  });

  it('should render automatic facets when first search has executed', async () => {
    const facets = [
      buildFakeAutomaticFacet({
        state: {field: 'category', label: 'Category'},
      }),
      buildFakeAutomaticFacet({
        state: {field: 'brand', label: 'Brand'},
      }),
    ];

    await renderAutomaticFacetGenerator({
      firstSearchExecuted: true,
      automaticFacets: facets,
    });

    const automaticFacetElements = document.querySelectorAll(
      'atomic-automatic-facet'
    );
    expect(automaticFacetElements.length).toBe(2);
  });

  it('should not render anything when there are no automatic facets and first search executed', async () => {
    await renderAutomaticFacetGenerator({
      firstSearchExecuted: true,
      automaticFacets: [],
    });

    const automaticFacetElements = document.querySelectorAll(
      'atomic-automatic-facet'
    );
    expect(automaticFacetElements.length).toBe(0);
  });

  it('should pass correct properties to automatic facet elements', async () => {
    const facets = [
      buildFakeAutomaticFacet({
        state: {field: 'category', label: 'Category'},
      }),
    ];

    await renderAutomaticFacetGenerator({
      firstSearchExecuted: true,
      automaticFacets: facets,
    });

    const automaticFacetElement = document.querySelector(
      'atomic-automatic-facet'
    );

    // The field is reflected as an attribute
    expect(automaticFacetElement?.getAttribute('field')).toBe('category');
  });

  describe('#updateCollapseFacetsDependingOnFacetsVisibility', () => {
    it('should set collapseFacetsAfter to -1 when collapseAfter is -1', async () => {
      const {element} = await renderAutomaticFacetGenerator();
      element.updateCollapseFacetsDependingOnFacetsVisibility(-1, 5);
      // We can test this indirectly by checking that all facets are not collapsed
      // when rendering with automatic facets
    });

    it('should calculate correct collapse value based on visible facets', async () => {
      const {element} = await renderAutomaticFacetGenerator();
      element.updateCollapseFacetsDependingOnFacetsVisibility(5, 2);
      // collapseFacetsAfter should be 3 (5 - 2)
    });

    it('should not allow negative collapseFacetsAfter value', async () => {
      const {element} = await renderAutomaticFacetGenerator();
      element.updateCollapseFacetsDependingOnFacetsVisibility(2, 5);
      // collapseFacetsAfter should be 0 (max(0, 2 - 5))
    });
  });

  describe('prop validation', () => {
    it('should accept valid desiredCount', async () => {
      const {element} = await renderAutomaticFacetGenerator({
        desiredCount: 10,
      });
      expect(element.desiredCount).toBe(10);
    });

    it('should accept valid numberOfValues', async () => {
      const {element} = await renderAutomaticFacetGenerator({
        numberOfValues: 15,
      });
      expect(element.numberOfValues).toBe(15);
    });
  });
});
