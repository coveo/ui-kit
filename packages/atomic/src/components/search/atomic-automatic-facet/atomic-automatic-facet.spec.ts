import type {
  AutomaticFacet,
  AutomaticFacetState,
  SearchStatus,
} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeAutomaticFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/automatic-facet-controller';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicAutomaticFacet} from './atomic-automatic-facet';
import './atomic-automatic-facet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-automatic-facet', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedFacet: AutomaticFacet;
  let mockedSearchStatus: SearchStatus;
  const mockedToggleSelect = vi.fn();
  const mockedDeselectAll = vi.fn();

  interface RenderAutomaticFacetOptions {
    field?: string;
    facetId?: string;
    isCollapsed?: boolean;
    state?: Partial<AutomaticFacetState>;
    searchStatusHasError?: boolean;
  }

  const renderAutomaticFacet = async ({
    field = 'objecttype',
    facetId = 'automatic-facet-1',
    isCollapsed = false,
    state = {},
    searchStatusHasError = false,
  }: RenderAutomaticFacetOptions = {}) => {
    mockedFacet = buildFakeAutomaticFacet({
      state: {
        field,
        label: 'Type',
        values: [
          {value: 'Document', numberOfResults: 45, state: 'idle'},
          {value: 'PDF', numberOfResults: 32, state: 'idle'},
        ],
        ...state,
      },
      implementation: {
        toggleSelect: mockedToggleSelect,
        deselectAll: mockedDeselectAll,
      },
    });

    mockedSearchStatus = buildFakeSearchStatus({
      state: {
        firstSearchExecuted: true,
        hasError: searchStatusHasError,
      },
    });

    const {element} = await renderInAtomicSearchInterface<AtomicAutomaticFacet>(
      {
        template: html`<div>
          <atomic-automatic-facet
            field=${field}
            facet-id=${facetId}
            .facet=${mockedFacet}
            .searchStatus=${mockedSearchStatus}
            ?is-collapsed=${isCollapsed}
          ></atomic-automatic-facet>
        </div>`,
        selector: 'atomic-automatic-facet',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.store.getUniqueIDFromEngine = vi.fn().mockReturnValue('123');
          return bindings;
        },
      }
    );

    return {
      element,
      label: () => page.getByRole('button', {name: /Type/i}),
      clearButton: () => page.getByLabelText(/Clear filter/i),
      value: (name: string) => page.getByText(name),
      parts: (element: AtomicAutomaticFacet) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part~="${part}"]`);
        return {
          facet: qs('facet'),
          labelButton: qs('label-button'),
          labelButtonIcon: qs('label-button-icon'),
          clearButton: qs('clear-button'),
          clearButtonIcon: qs('clear-button-icon'),
          values: element.shadowRoot?.querySelector('[part="values"]'),
          valueCheckboxes: element.shadowRoot?.querySelectorAll(
            '[part~="value-checkbox"]'
          ),
          valueLabels: element.shadowRoot?.querySelectorAll(
            '[part~="value-label"]'
          ),
          valueCounts: element.shadowRoot?.querySelectorAll(
            '[part~="value-count"]'
          ),
        };
      },
    };
  };

  it('should render the facet with correct label', async () => {
    const {label} = await renderAutomaticFacet();
    await expect.element(label()).toBeInTheDocument();
  });

  it('should use field name when label is undefined', async () => {
    await renderAutomaticFacet({
      field: 'my_custom_field',
      state: {label: undefined},
    });
    await expect
      .element(page.getByRole('button', {name: /my_custom_field/i}))
      .toBeInTheDocument();
  });

  it('should render facet values', async () => {
    const {value} = await renderAutomaticFacet();
    await expect.element(value('Document')).toBeInTheDocument();
    await expect.element(value('PDF')).toBeInTheDocument();
  });

  it('should display the correct number of results for each value', async () => {
    await renderAutomaticFacet();
    await expect.element(page.getByText('(45)')).toBeInTheDocument();
    await expect.element(page.getByText('(32)')).toBeInTheDocument();
  });

  it('should hide values when collapsed', async () => {
    const {element, parts} = await renderAutomaticFacet({isCollapsed: true});
    expect(parts(element).values).toBeNull();
  });

  it('should show values when expanded', async () => {
    const {element, parts} = await renderAutomaticFacet({isCollapsed: false});
    expect(parts(element).values).not.toBeNull();
  });

  it('should toggle collapse when label button is clicked', async () => {
    const {element, label} = await renderAutomaticFacet({isCollapsed: false});

    await userEvent.click(label()!);
    expect(element.isCollapsed).toBe(true);

    await userEvent.click(label()!);
    expect(element.isCollapsed).toBe(false);
  });

  it('should call toggleSelect when a value is clicked', async () => {
    const {element} = await renderAutomaticFacet();
    const firstCheckbox = element.shadowRoot?.querySelector(
      '[part~="value-checkbox"]'
    ) as HTMLElement;

    await userEvent.click(firstCheckbox);
    expect(mockedToggleSelect).toHaveBeenCalledWith(
      mockedFacet.state.values[0]
    );
  });

  it('should not show clear button when no values are selected', async () => {
    const {element, parts} = await renderAutomaticFacet();
    expect(parts(element).clearButton).toBeNull();
  });

  it('should call deselectAll when clear button is clicked', async () => {
    const {element, parts} = await renderAutomaticFacet({
      state: {
        values: [{value: 'Document', numberOfResults: 45, state: 'selected'}],
      },
    });

    const clearButton = parts(element).clearButton as HTMLElement;
    await userEvent.click(clearButton);
    expect(mockedDeselectAll).toHaveBeenCalled();
  });

  describe('shadow parts', () => {
    it('should expose facet part', async () => {
      const {element, parts} = await renderAutomaticFacet();
      expect(parts(element).facet).not.toBeNull();
    });

    it('should expose label-button part', async () => {
      const {element, parts} = await renderAutomaticFacet();
      expect(parts(element).labelButton).not.toBeNull();
    });

    it('should expose label-button-icon part', async () => {
      const {element, parts} = await renderAutomaticFacet();
      expect(parts(element).labelButtonIcon).not.toBeNull();
    });

    it('should expose values part when expanded', async () => {
      const {element, parts} = await renderAutomaticFacet({isCollapsed: false});
      expect(parts(element).values).not.toBeNull();
    });

    it('should expose value-checkbox parts', async () => {
      const {element, parts} = await renderAutomaticFacet();
      expect(parts(element).valueCheckboxes?.length).toBe(2);
    });

    it('should expose value-label parts', async () => {
      const {element, parts} = await renderAutomaticFacet();
      expect(parts(element).valueLabels?.length).toBe(2);
    });

    it('should expose value-count parts', async () => {
      const {element, parts} = await renderAutomaticFacet();
      expect(parts(element).valueCounts?.length).toBe(2);
    });

    describe('when values are selected', () => {
      it('should expose clear-button part', async () => {
        const {element, parts} = await renderAutomaticFacet({
          state: {
            values: [
              {value: 'Document', numberOfResults: 45, state: 'selected'},
            ],
          },
        });
        expect(parts(element).clearButton).not.toBeNull();
      });

      it('should expose clear-button-icon part', async () => {
        const {element, parts} = await renderAutomaticFacet({
          state: {
            values: [
              {value: 'Document', numberOfResults: 45, state: 'selected'},
            ],
          },
        });
        expect(parts(element).clearButtonIcon).not.toBeNull();
      });
    });
  });
});
