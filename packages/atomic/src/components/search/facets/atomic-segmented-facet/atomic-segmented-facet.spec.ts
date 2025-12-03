import {
  buildFacet,
  buildFacetConditionsManager,
  buildSearchStatus,
  buildTabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeFacetConditionsManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-conditions-manager';
import {buildFakeFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicSegmentedFacet} from './atomic-segmented-facet';
import './atomic-segmented-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-segmented-facet', () => {
  const mockedEngine = buildFakeSearchEngine();

  const renderComponent = async (
    options: {
      field?: string;
      label?: string;
      facetState?: Partial<Parameters<typeof buildFakeFacet>[0]>['state'];
      searchStatusState?: Partial<Parameters<typeof buildFakeSearchStatus>[0]>;
    } = {}
  ) => {
    const {element, atomicInterface} =
      await renderInAtomicSearchInterface<AtomicSegmentedFacet>({
        template: html`<atomic-segmented-facet
          field=${options.field ?? 'objecttype'}
          label=${options.label ?? 'Object Type'}
        ></atomic-segmented-facet>`,
        selector: 'atomic-segmented-facet',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element.updateComplete;

    const parts = {
      get segmentedContainer() {
        return element.shadowRoot?.querySelector(
          '[part="segmented-container"]'
        );
      },
      get label() {
        return element.shadowRoot?.querySelector('[part="label"]');
      },
      get values() {
        return element.shadowRoot?.querySelector('[part="values"]');
      },
      get valueBoxes() {
        return element.shadowRoot?.querySelectorAll('[part~="value-box"]');
      },
      get selectedValueBox() {
        return element.shadowRoot?.querySelector(
          '[part~="value-box-selected"]'
        );
      },
      get placeholder() {
        return element.shadowRoot?.querySelector('[part="placeholder"]');
      },
    };

    return {element, parts, atomicInterface};
  };

  beforeEach(() => {
    vi.mocked(buildSearchStatus).mockImplementation(() =>
      buildFakeSearchStatus({
        hasError: false,
        firstSearchExecuted: true,
        hasResults: true,
      })
    );

    vi.mocked(buildTabManager).mockImplementation(() =>
      buildFakeTabManager({activeTab: 'All'})
    );

    vi.mocked(buildFacet).mockImplementation(() =>
      buildFakeFacet({
        state: {
          enabled: true,
          values: [
            {value: 'FAQ', numberOfResults: 10, state: 'idle'},
            {value: 'Page', numberOfResults: 25, state: 'idle'},
            {value: 'File', numberOfResults: 5, state: 'idle'},
          ],
        },
      })
    );

    vi.mocked(buildFacetConditionsManager).mockImplementation(() =>
      buildFakeFacetConditionsManager()
    );
  });

  describe('#initialize', () => {
    it('should build the SearchStatus controller', async () => {
      await renderComponent();

      expect(vi.mocked(buildSearchStatus)).toHaveBeenCalledWith(mockedEngine);
    });

    it('should build the TabManager controller', async () => {
      await renderComponent();

      expect(vi.mocked(buildTabManager)).toHaveBeenCalledWith(mockedEngine);
    });

    it('should build the Facet controller with correct options', async () => {
      await renderComponent({field: 'author', label: 'Author'});

      expect(vi.mocked(buildFacet)).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: 'author',
          }),
        })
      );
    });

    it('should build FacetConditionsManager', async () => {
      await renderComponent();

      expect(vi.mocked(buildFacetConditionsManager)).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          facetId: expect.any(String),
          conditions: [],
        })
      );
    });
  });

  describe('#render', () => {
    it('should render the segmented container when facet has values', async () => {
      const {parts} = await renderComponent();

      expect(parts.segmentedContainer).not.toBeNull();
    });

    it('should render the label when provided', async () => {
      const {parts} = await renderComponent({label: 'Test Label'});

      expect(parts.label).not.toBeNull();
      expect(parts.label?.textContent).toContain('Test Label');
    });

    it('should render values container', async () => {
      const {parts} = await renderComponent();

      expect(parts.values).not.toBeNull();
    });

    it('should render all facet values', async () => {
      const {parts} = await renderComponent();

      expect(parts.valueBoxes?.length).toBe(3);
    });

    it('should render nothing when search has error', async () => {
      vi.mocked(buildSearchStatus).mockImplementation(() =>
        buildFakeSearchStatus({
          hasError: true,
        })
      );

      const {parts} = await renderComponent();

      expect(parts.segmentedContainer).toBeNull();
      expect(parts.placeholder).toBeNull();
    });

    it('should render nothing when facet is disabled', async () => {
      vi.mocked(buildFacet).mockImplementation(() =>
        buildFakeFacet({
          state: {enabled: false},
        })
      );

      const {parts} = await renderComponent();

      expect(parts.segmentedContainer).toBeNull();
    });

    it('should render placeholder when first search not executed', async () => {
      vi.mocked(buildSearchStatus).mockImplementation(() =>
        buildFakeSearchStatus({
          firstSearchExecuted: false,
        })
      );

      const {parts} = await renderComponent();

      expect(parts.placeholder).not.toBeNull();
      expect(parts.segmentedContainer).toBeNull();
    });

    it('should render nothing when no values', async () => {
      vi.mocked(buildFacet).mockImplementation(() =>
        buildFakeFacet({
          state: {values: []},
        })
      );

      const {parts} = await renderComponent();

      expect(parts.segmentedContainer).toBeNull();
    });
  });

  describe('when a value is selected', () => {
    beforeEach(() => {
      vi.mocked(buildFacet).mockImplementation(() =>
        buildFakeFacet({
          state: {
            enabled: true,
            values: [
              {value: 'FAQ', numberOfResults: 10, state: 'selected'},
              {value: 'Page', numberOfResults: 25, state: 'idle'},
            ],
          },
        })
      );
    });

    it('should show value-box-selected part on selected value', async () => {
      const {parts} = await renderComponent();

      expect(parts.selectedValueBox).not.toBeNull();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should stop watching facet conditions manager', async () => {
      const mockStopWatching = vi.fn();
      vi.mocked(buildFacetConditionsManager).mockImplementation(() =>
        buildFakeFacetConditionsManager({stopWatching: mockStopWatching})
      );

      const {element} = await renderComponent();
      element.remove();

      expect(mockStopWatching).toHaveBeenCalled();
    });
  });

  describe('when clicking a value', () => {
    it('should call toggleSingleSelect on the facet', async () => {
      const mockToggleSingleSelect = vi.fn();
      vi.mocked(buildFacet).mockImplementation(() =>
        buildFakeFacet({
          implementation: {toggleSingleSelect: mockToggleSingleSelect},
          state: {
            enabled: true,
            values: [
              {value: 'FAQ', numberOfResults: 10, state: 'idle'},
              {value: 'Page', numberOfResults: 25, state: 'idle'},
            ],
          },
        })
      );

      const {parts} = await renderComponent();

      const firstValueBox = parts.valueBoxes?.[0] as HTMLButtonElement;
      firstValueBox?.click();

      expect(mockToggleSingleSelect).toHaveBeenCalledWith(
        expect.objectContaining({value: 'FAQ'})
      );
    });
  });
});
