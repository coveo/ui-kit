import {buildFacetManager} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeFacetManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-manager';
import {AtomicFacetManager} from './atomic-facet-manager';
import './atomic-facet-manager';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-facet-manager', () => {
  const mockEngine = buildFakeSearchEngine();

  const renderComponent = async ({
    props = {},
    slottedContent = '',
    mockSortImplementation,
  }: {
    props?: {collapseFacetsAfter?: number};
    slottedContent?: string;
    mockSortImplementation?: <T>(payload: T[]) => T[];
  } = {}) => {
    const defaultSort = <T>(payload: T[]) => payload;
    vi.mocked(buildFacetManager).mockReturnValue(
      buildFakeFacetManager({
        implementation: {
          sort: (mockSortImplementation ?? defaultSort) as never,
        },
      })
    );

    const template = html`
      <atomic-facet-manager .collapseFacetsAfter=${props.collapseFacetsAfter ?? 4}>
        ${slottedContent}
      </atomic-facet-manager>
    `;

    const {element} = await renderInAtomicSearchInterface<AtomicFacetManager>({
      template,
      selector: 'atomic-facet-manager',
      bindings: (bindings) => {
        bindings.engine = mockEngine;
        bindings.store = {
          ...bindings.store,
          getAllFacets: vi.fn(() => ({})),
        };
        return bindings;
      },
    });

    return {
      element,
    };
  };

  type MockFacet = HTMLElement & {facetId: string; isCollapsed: boolean};

  const createMockFacet = (facetId: string): MockFacet => {
    const facet = document.createElement('div') as unknown as MockFacet;
    facet.facetId = facetId;
    facet.isCollapsed = false;
    return facet;
  };

  const createMockPopover = (facet: MockFacet) => {
    const popover = document.createElement('atomic-popover');
    popover.appendChild(facet);
    return popover;
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-facet-manager');
    expect(el).toBeInstanceOf(AtomicFacetManager);
  });

  it('should build a facet manager controller', async () => {
    await renderComponent();
    expect(buildFacetManager).toHaveBeenCalledWith(mockEngine);
  });

  it('should have default collapseFacetsAfter property of 4', async () => {
    const {element} = await renderComponent();
    expect(element?.collapseFacetsAfter).toBe(4);
  });

  it('should accept valid collapseFacetsAfter values', async () => {
    const {element} = await renderComponent({
      props: {collapseFacetsAfter: 2},
    });
    expect(element?.collapseFacetsAfter).toBe(2);
  });

  it('should accept 0 to collapse all facets', async () => {
    const {element} = await renderComponent({
      props: {collapseFacetsAfter: 0},
    });
    expect(element?.collapseFacetsAfter).toBe(0);
  });

  it('should accept -1 to disable auto-collapse', async () => {
    const {element} = await renderComponent({
      props: {collapseFacetsAfter: -1},
    });
    expect(element?.collapseFacetsAfter).toBe(-1);
  });

  it('should allow slotted content', async () => {
    await renderComponent({
      slottedContent: '<div class="test-content">Test</div>',
    });
    await expect.element(page.getByText('Test')).toBeInTheDocument();
  });

  describe('when sorting facets', () => {
    it('should use facet manager to sort facets', async () => {
      const mockSort = vi.fn(<T>(payload: T[]) => payload);

      await renderComponent({
        mockSortImplementation: mockSort as never,
      });

      expect(mockSort).toHaveBeenCalled();
    });
  });

  describe('when managing visibility', () => {
    it('should separate facets by visibility when sorting', async () => {
      const {element} = await renderComponent();

      const getAllFacetsSpy = vi.spyOn(element!.bindings.store, 'getAllFacets');

      await element?.sortFacets();

      expect(getAllFacetsSpy).toHaveBeenCalled();
    });
  });

  describe('when managing collapse state', () => {
    const createMockGenerator = () => {
      const generator = document.createElement(
        'atomic-automatic-facet-generator'
      ) as unknown as HTMLElement & {
        updateCollapseFacetsDependingOnFacetsVisibility: ReturnType<typeof vi.fn>;
      };
      generator.updateCollapseFacetsDependingOnFacetsVisibility = vi.fn();
      return generator;
    };

    it('should apply collapse logic based on collapseFacetsAfter property', async () => {
      const mockSort = vi.fn(<T>(payload: T[]) => payload);
      const mockFacet1 = createMockFacet('facet1');
      const mockFacet2 = createMockFacet('facet2');
      const mockFacet3 = createMockFacet('facet3');

      const {element} = await renderComponent({
        props: {collapseFacetsAfter: 2},
        mockSortImplementation: mockSort as never,
      });

      element?.appendChild(mockFacet1);
      element?.appendChild(mockFacet2);
      element?.appendChild(mockFacet3);

      await element?.sortFacets();

      expect(mockSort).toHaveBeenCalled();

      expect(mockFacet1.isCollapsed).toBe(false);
      expect(mockFacet2.isCollapsed).toBe(false);
      expect(mockFacet3.isCollapsed).toBe(true);
    });

    it('should allow collapsing all facets with value 0', async () => {
      const mockSort = vi.fn(<T>(payload: T[]) => payload);
      const mockFacet1 = createMockFacet('facet1');
      const mockFacet2 = createMockFacet('facet2');

      const {element} = await renderComponent({
        props: {collapseFacetsAfter: 0},
        mockSortImplementation: mockSort as never,
      });

      element?.appendChild(mockFacet1);
      element?.appendChild(mockFacet2);

      await element?.sortFacets();

      expect(mockSort).toHaveBeenCalled();

      expect(mockFacet1.isCollapsed).toBe(true);
      expect(mockFacet2.isCollapsed).toBe(true);
    });

    it('should allow disabling auto-collapse with value -1', async () => {
      const mockSort = vi.fn(<T>(payload: T[]) => payload);
      const mockFacet1 = createMockFacet('facet1');
      const mockFacet2 = createMockFacet('facet2');
      const mockFacet3 = createMockFacet('facet3');

      const {element} = await renderComponent({
        props: {collapseFacetsAfter: -1},
        mockSortImplementation: mockSort as never,
      });

      element?.appendChild(mockFacet1);
      element?.appendChild(mockFacet2);
      element?.appendChild(mockFacet3);

      await element?.sortFacets();

      expect(mockSort).toHaveBeenCalled();

      expect(mockFacet1.isCollapsed).toBe(false);
      expect(mockFacet2.isCollapsed).toBe(false);
      expect(mockFacet3.isCollapsed).toBe(false);
    });

    it('should update automatic facet generator collapse state', async () => {
      const mockSort = vi.fn(<T>(payload: T[]) => payload);
      const mockFacet1 = createMockFacet('facet1');
      const mockFacet2 = createMockFacet('facet2');
      const mockGenerator = createMockGenerator();

      const {element} = await renderComponent({
        props: {collapseFacetsAfter: 3},
        mockSortImplementation: mockSort as never,
      });

      element?.appendChild(mockFacet1);
      element?.appendChild(mockFacet2);
      element?.appendChild(mockGenerator);

      await element?.sortFacets();

      expect(mockGenerator.updateCollapseFacetsDependingOnFacetsVisibility).toHaveBeenCalledWith(
        3,
        2
      );
    });
  });

  describe('when facets are nested inside popovers', () => {
    const reverseSort = <T>(payload: T[]) => [...payload].reverse();

    it('should sort the facets nested inside popovers', async () => {
      const mockSort = vi.fn(reverseSort);
      const facet1 = createMockFacet('facet1');
      const facet2 = createMockFacet('facet2');

      const {element} = await renderComponent({
        mockSortImplementation: mockSort as never,
      });

      element?.append(createMockPopover(facet1), createMockPopover(facet2));

      await element?.sortFacets();

      expect(mockSort).toHaveBeenCalledWith([
        {facetId: 'facet1', payload: facet1},
        {facetId: 'facet2', payload: facet2},
      ]);
    });

    it('should reorder the popovers rather than their nested facets', async () => {
      const facet1 = createMockFacet('facet1');
      const facet2 = createMockFacet('facet2');
      const popover1 = createMockPopover(facet1);
      const popover2 = createMockPopover(facet2);

      const {element} = await renderComponent({
        mockSortImplementation: reverseSort as never,
      });

      element?.append(popover1, popover2);

      await element?.sortFacets();

      expect(popover1.previousElementSibling).toBe(popover2);
      expect(facet1.parentElement).toBe(popover1);
      expect(facet2.parentElement).toBe(popover2);
    });

    it('should reorder popovers alongside facets that are not nested', async () => {
      const facet1 = createMockFacet('facet1');
      const facet2 = createMockFacet('facet2');
      const facet3 = createMockFacet('facet3');
      const popover = createMockPopover(facet2);

      const {element} = await renderComponent({
        mockSortImplementation: reverseSort as never,
      });

      element?.append(facet1, popover, facet3);

      await element?.sortFacets();

      expect(popover.previousElementSibling).toBe(facet3);
      expect(popover.nextElementSibling).toBe(facet1);
    });

    it('should not collapse facets nested inside popovers', async () => {
      const facet = createMockFacet('facet1');

      const {element} = await renderComponent({
        props: {collapseFacetsAfter: 0},
      });

      element?.append(createMockPopover(facet));

      await element?.sortFacets();

      expect(facet.isCollapsed).toBe(false);
    });

    it('should exclude facets nested inside popovers from the automatic facet generator collapse count', async () => {
      const mockGenerator = document.createElement(
        'atomic-automatic-facet-generator'
      ) as unknown as HTMLElement & {
        updateCollapseFacetsDependingOnFacetsVisibility: ReturnType<typeof vi.fn>;
      };
      mockGenerator.updateCollapseFacetsDependingOnFacetsVisibility = vi.fn();

      const {element} = await renderComponent({
        props: {collapseFacetsAfter: 3},
      });

      element?.append(
        createMockFacet('facet1'),
        createMockPopover(createMockFacet('facet2')),
        mockGenerator
      );

      await element?.sortFacets();

      expect(mockGenerator.updateCollapseFacetsDependingOnFacetsVisibility).toHaveBeenCalledWith(
        3,
        1
      );
    });
  });
});
