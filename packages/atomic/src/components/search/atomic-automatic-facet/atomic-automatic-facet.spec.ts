import {buildAutomaticFacetGenerator, buildSearchStatus} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import './atomic-automatic-facet';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeAutomaticFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/automatic-facet-controller';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicAutomaticFacet} from './atomic-automatic-facet';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

describe('atomic-automatic-facet', () => {
  const mockEngine = buildFakeSearchEngine();

  beforeEach(() => {
    vi.mocked(buildAutomaticFacetGenerator).mockReturnValue(
      {} as ReturnType<typeof buildAutomaticFacetGenerator>
    );
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        firstSearchExecuted: true,
        hasError: false,
      })
    );
  });

  const renderComponent = async ({
    field = 'test_field',
    facetId = 'test-facet-id',
    facetState = {},
    searchStatusState = {},
    isCollapsed = false,
  }: {
    field?: string;
    facetId?: string;
    facetState?: Partial<ReturnType<typeof buildFakeAutomaticFacet>['state']>;
    searchStatusState?: Partial<
      ReturnType<typeof buildFakeSearchStatus>['state']
    >;
    isCollapsed?: boolean;
  } = {}) => {
    const fakeFacet = buildFakeAutomaticFacet({
      state: {
        field,
        label: 'Test Label',
        values: [
          {
            value: 'value1',
            numberOfResults: 10,
            state: 'idle',
          },
          {
            value: 'value2',
            numberOfResults: 5,
            state: 'idle',
          },
        ],
        ...facetState,
      },
    });

    const fakeSearchStatus = buildFakeSearchStatus({
      state: {
        firstSearchExecuted: true,
        hasError: false,
        ...searchStatusState,
      },
    });

    const {element} = await renderInAtomicSearchInterface<AtomicAutomaticFacet>(
      {
        template: html`<atomic-automatic-facet
          field=${field}
          facet-id=${facetId}
          .facet=${fakeFacet}
          .searchStatus=${fakeSearchStatus}
          is-collapsed=${isCollapsed}
        ></atomic-automatic-facet>`,
        selector: 'atomic-automatic-facet',
        bindings: (bindings) => ({
          ...bindings,
          engine: mockEngine,
        }),
      }
    );

    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part~="${part}"]`)!;

    return {
      element,
      facet: fakeFacet,
      searchStatus: fakeSearchStatus,
      parts: (el: AtomicAutomaticFacet) => ({
        facet: qs('facet'),
        labelButton: qs('label-button'),
        labelButtonIcon: qs('label-button-icon'),
        clearButton: qs('clear-button'),
        clearButtonIcon: qs('clear-button-icon'),
        values: el.shadowRoot?.querySelector('[part="values"]'),
        valueLabels: el.shadowRoot?.querySelectorAll('[part~="value-label"]'),
        valueCounts: el.shadowRoot?.querySelectorAll('[part~="value-count"]'),
        valueCheckboxes: el.shadowRoot?.querySelectorAll(
          '[part~="value-checkbox"]'
        ),
      }),
    };
  };

  describe('#initialize', () => {
    it('should not set error when initialized correctly', async () => {
      const {element} = await renderComponent();
      expect(element.error).toBeUndefined();
    });
  });

  describe('render', () => {
    it('should render the facet container', async () => {
      const {element, parts} = await renderComponent();
      await expect.element(parts(element).facet).toBeInTheDocument();
    });

    it('should render the facet label from state', async () => {
      await renderComponent({
        facetState: {label: 'Custom Label'},
      });
      await expect.element(page.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should use field name when label is undefined', async () => {
      await renderComponent({
        field: 'my_field',
        facetState: {label: undefined},
      });
      await expect.element(page.getByText('my_field')).toBeInTheDocument();
    });

    it('should render facet values', async () => {
      const {element, parts} = await renderComponent();
      const valueLabels = parts(element).valueLabels;
      expect(valueLabels?.length).toBe(2);
    });

    it('should display the correct number of results for each value', async () => {
      await renderComponent();
      await expect.element(page.getByText('(10)')).toBeInTheDocument();
      await expect.element(page.getByText('(5)')).toBeInTheDocument();
    });

    it('should not render values when facet is collapsed', async () => {
      const {element, parts} = await renderComponent({isCollapsed: true});
      expect(parts(element).values).toBeNull();
    });

    it('should render nothing when search has error', async () => {
      const {element, parts} = await renderComponent({
        searchStatusState: {hasError: true},
      });
      expect(parts(element).facet).toBeNull();
    });
  });

  describe('when toggling collapse', () => {
    it('should toggle isCollapsed when label button is clicked', async () => {
      const {element, parts} = await renderComponent({isCollapsed: false});
      const labelButton = parts(element).labelButton as HTMLElement;

      await userEvent.click(labelButton);
      expect(element.isCollapsed).toBe(true);

      await userEvent.click(labelButton);
      expect(element.isCollapsed).toBe(false);
    });

    it('should show values when expanded', async () => {
      const {element, parts} = await renderComponent({isCollapsed: false});
      expect(parts(element).values).not.toBeNull();
    });

    it('should hide values when collapsed', async () => {
      const {element, parts} = await renderComponent({isCollapsed: true});
      expect(parts(element).values).toBeNull();
    });
  });

  describe('when selecting values', () => {
    it('should call toggleSelect when a value is clicked', async () => {
      const {element, facet} = await renderComponent();
      const toggleSelectSpy = vi.spyOn(facet, 'toggleSelect');

      const firstValue = facet.state.values[0];
      const firstCheckbox = element.shadowRoot?.querySelector(
        '[part~="value-checkbox"]'
      ) as HTMLElement;

      await userEvent.click(firstCheckbox);
      expect(toggleSelectSpy).toHaveBeenCalledWith(firstValue);
    });

    it('should display clear button when values are selected', async () => {
      const {element, parts} = await renderComponent({
        facetState: {
          values: [
            {
              value: 'selected_value',
              numberOfResults: 10,
              state: 'selected',
            },
          ],
        },
      });

      await expect
        .element(parts(element).clearButton as HTMLElement)
        .toBeInTheDocument();
    });

    it('should not display clear button when no values are selected', async () => {
      const {element, parts} = await renderComponent();
      expect(parts(element).clearButton).toBeNull();
    });
  });

  describe('when clearing filters', () => {
    it('should call deselectAll when clear button is clicked', async () => {
      const {element, facet, parts} = await renderComponent({
        facetState: {
          values: [
            {
              value: 'selected_value',
              numberOfResults: 10,
              state: 'selected',
            },
          ],
        },
      });

      const deselectAllSpy = vi.spyOn(facet, 'deselectAll');
      const clearButton = parts(element).clearButton as HTMLElement;

      await userEvent.click(clearButton);
      expect(deselectAllSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-expanded attribute when collapsed', async () => {
      const {element, parts} = await renderComponent({isCollapsed: true});
      const labelButton = parts(element).labelButton as HTMLElement;
      expect(labelButton.getAttribute('aria-expanded')).toBe('false');
    });

    it('should have proper aria-expanded attribute when expanded', async () => {
      const {element, parts} = await renderComponent({isCollapsed: false});
      const labelButton = parts(element).labelButton as HTMLElement;
      expect(labelButton.getAttribute('aria-expanded')).toBe('true');
    });

    it('should render values in a list', async () => {
      const {element, parts} = await renderComponent();
      const valuesList = parts(element).values as HTMLElement;
      expect(valuesList.tagName.toLowerCase()).toBe('ul');
    });
  });

  describe('field value captions', () => {
    it('should use field value caption for display value', async () => {
      await renderComponent({
        facetState: {
          values: [
            {
              value: 'test_value',
              numberOfResults: 10,
              state: 'idle',
            },
          ],
        },
      });
      // The component uses getFieldValueCaption which will use i18n to format the value
      await expect.element(page.getByText('test_value')).toBeInTheDocument();
    });
  });

  describe('shadow parts', () => {
    it('should expose facet part', async () => {
      const {element, parts} = await renderComponent();
      expect(parts(element).facet).not.toBeNull();
    });

    it('should expose label-button part', async () => {
      const {element, parts} = await renderComponent();
      expect(parts(element).labelButton).not.toBeNull();
    });

    it('should expose label-button-icon part', async () => {
      const {element, parts} = await renderComponent();
      expect(parts(element).labelButtonIcon).not.toBeNull();
    });

    it('should expose values part', async () => {
      const {element, parts} = await renderComponent({isCollapsed: false});
      expect(parts(element).values).not.toBeNull();
    });

    it('should expose value-checkbox parts', async () => {
      const {element, parts} = await renderComponent();
      expect(parts(element).valueCheckboxes?.length).toBeGreaterThan(0);
    });

    it('should expose value-label parts', async () => {
      const {element, parts} = await renderComponent();
      expect(parts(element).valueLabels?.length).toBeGreaterThan(0);
    });

    it('should expose value-count parts', async () => {
      const {element, parts} = await renderComponent();
      expect(parts(element).valueCounts?.length).toBeGreaterThan(0);
    });
  });
});
