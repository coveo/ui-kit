import {AnyBindings} from '@/src/components';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {DateFilterRange} from '@coveo/headless';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, it, expect, vi} from 'vitest';
import './atomic-facet-date-input';
import {AtomicFacetDateInput} from './atomic-facet-date-input';

describe('AtomicFacetDateInput', () => {
  const setupElement = async (
    props: Partial<{
      facetId: string;
      label: string;
      rangeGetter: () => DateFilterRange | undefined;
      rangeSetter: (range: DateFilterRange) => void;
      parentNode: HTMLElement;
    }> = {}
  ) => {
    const timeFrameFacet =
      props.parentNode ||
      document.createElement('atomic-commerce-timeframe-facet');

    const element = await fixture<AtomicFacetDateInput>(
      html`<atomic-facet-date-input
        .facetId=${props.facetId ?? 'test-facet'}
        .label=${props.label ?? 'test-label'}
        .rangeGetter=${props.rangeGetter ?? vi.fn(() => undefined)}
        .rangeSetter=${props.rangeSetter ?? vi.fn()}
        .bindings=${{
          i18n: {
            t: vi.fn((key: string, values?: Record<string, unknown>) => {
              const translations: Record<string, string> = {
                start: 'Start',
                end: 'End',
                apply: 'Apply',
                'date-input-start': `Start date for ${values?.label || 'facet'}`,
                'date-input-end': `End date for ${values?.label || 'facet'}`,
                'date-input-apply': `Apply date range for ${values?.label || 'facet'}`,
              };
              return translations[key] || key;
            }),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as unknown as AnyBindings}
      ></atomic-facet-date-input>`,
      timeFrameFacet
    );

    return {
      element,
      get form() {
        return element.shadowRoot?.querySelector('form');
      },
      get startInput() {
        return page.getByLabelText(/Start date/);
      },
      get endInput() {
        return page.getByLabelText(/End date/);
      },
      get applyButton() {
        return page.getByRole('button', {name: /Apply/});
      },
    };
  };

  it('is defined', () => {
    const el = document.createElement('atomic-facet-date-input');
    expect(el).toBeInstanceOf(AtomicFacetDateInput);
  });

  it('should render the component', async () => {
    const {element, form} = await setupElement();
    expect(element.shadowRoot).toBeTruthy();
    expect(form).toBeTruthy();
  });

  it('should render start and end date inputs', async () => {
    const {startInput, endInput} = await setupElement();

    await expect.element(startInput).toBeInTheDocument();
    await expect.element(endInput).toBeInTheDocument();
    await expect.element(startInput).toHaveAttribute('type', 'date');
    await expect.element(endInput).toHaveAttribute('type', 'date');
  });

  it('should render apply button', async () => {
    const {applyButton} = await setupElement();

    await expect.element(applyButton).toBeInTheDocument();
    await expect.element(applyButton).toHaveAttribute('type', 'submit');
  });

  it('should have proper parts attributes', async () => {
    const {element} = await setupElement();

    const startInput = element.shadowRoot?.querySelector(
      'input[type="date"]:first-of-type'
    );
    const endInput = element.shadowRoot?.querySelector(
      'input[type="date"]:last-of-type'
    );
    const applyButton = element.shadowRoot?.querySelector(
      'button[type="submit"]'
    );

    expect(startInput).toHaveAttribute('part', 'input-start');
    expect(endInput).toHaveAttribute('part', 'input-end');
    expect(applyButton).toHaveAttribute('part', 'input-apply-button');
  });

  it('should display an error when parent is invalid', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const {element} = await setupElement({
      parentNode: document.createElement('div'),
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'atomic-facet-date-input is an internal component and should only be used within <atomic-commerce-timeframe-facet>'
        ),
      }),
      element
    );

    consoleErrorSpy.mockRestore();
  });
});
