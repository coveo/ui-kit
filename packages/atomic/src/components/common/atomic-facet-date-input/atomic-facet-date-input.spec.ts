/** biome-ignore-all lint/style/noNonNullAssertion: For testing, locators should always exist */

import type {DateFilterRange} from '@coveo/headless';
import {html} from 'lit';
import {when} from 'lit/directives/when.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import './atomic-facet-date-input';
import {AtomicFacetDateInput} from './atomic-facet-date-input';

describe('atomic-facet-date-input', () => {
  let consoleErrorSpy: MockInstance;

  const setupElement = async (
    props: Partial<{
      facetId: string;
      label: string;
      inputRange: DateFilterRange;
      dateInputCallback: () => DateFilterRange;
      validParent: boolean;
    }> = {}
  ) => {
    const dateInputTemplate = html`<atomic-facet-date-input
      .facetId=${props.facetId ?? 'test-facet'}
      .label=${props.label ?? 'test-label'}
      .inputRange=${props.inputRange ?? {start: '', end: ''}}
      @atomic-date-input-apply=${() =>
        props.dateInputCallback ? props.dateInputCallback() : vi.fn()}
    ></atomic-facet-date-input>`;

    const {element} =
      await renderInAtomicCommerceInterface<AtomicFacetDateInput>({
        template: html`${when(
          props.validParent ?? true,
          () =>
            html`<atomic-timeframe-facet>
              ${dateInputTemplate}
            </atomic-timeframe-facet> `,
          () => dateInputTemplate
        )} `,
        selector: 'atomic-facet-date-input',
      });
    return {
      element,
      get form() {
        return element.querySelector('form');
      },
      get startInput() {
        return element.querySelector('[part="input-start"]')!;
      },
      get startInputLabel() {
        return page.getByText('Start:', {exact: true});
      },
      get endInput() {
        return element.querySelector('[part="input-end"]')!;
      },
      get endInputLabel() {
        return page.getByText('End:', {exact: true});
      },
      get applyButton() {
        return page.getByRole('button', {name: /Apply/});
      },
    };
  };

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should initialize', async () => {
    const {element} = await setupElement();
    expect(element).toBeInstanceOf(AtomicFacetDateInput);
  });

  it('should render the form', async () => {
    const {form} = await setupElement();
    expect(form).toBeInTheDocument();
  });

  it('should render the inputs ', async () => {
    const {startInput, startInputLabel, endInput, endInputLabel} =
      await setupElement();
    expect(startInput).toBeInTheDocument();
    expect(startInputLabel).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
    expect(endInputLabel).toBeInTheDocument();
  });

  it('should have the correct parts on input labels ', async () => {
    const {startInputLabel, endInputLabel} = await setupElement();
    expect(startInputLabel).toHaveAttribute('part', 'input-label');
    expect(endInputLabel).toHaveAttribute('part', 'input-label');
  });

  it('should have the correct type on inputs ', async () => {
    const {startInput, endInput} = await setupElement();

    expect(startInput).toHaveAttribute('type', 'date');
    expect(endInput).toHaveAttribute('type', 'date');
  });

  it('should have the localized placeholder on inputs', async () => {
    const {startInput, endInput} = await setupElement();

    expect(startInput).toHaveAttribute('placeholder', 'yyyy-mm-dd');
    expect(endInput).toHaveAttribute('placeholder', 'yyyy-mm-dd');
  });

  it('should render apply button', async () => {
    const {applyButton} = await setupElement();

    await expect.element(applyButton).toBeInTheDocument();
  });

  it('should have correct type on apply button', async () => {
    const {applyButton} = await setupElement();
    await expect.element(applyButton).toHaveAttribute('type', 'submit');
  });

  it('should have correct part on apply button', async () => {
    const {applyButton} = await setupElement();
    await expect
      .element(applyButton)
      .toHaveAttribute('part', 'input-apply-button');
  });

  it('should display an error when parent is invalid', async () => {
    const {element} = await setupElement({
      validParent: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'atomic-facet-date-input is an internal component and should only be used within a timeframe facet'
        ),
      }),
      element
    );
  });

  it('should set the inputs to the provided input range', async () => {
    const {startInput, endInput} = await setupElement({
      inputRange: {start: '2023-01-01', end: '2023-12-31'},
    });

    expect(startInput).toHaveValue('2023-01-01');
    expect(endInput).toHaveValue('2023-12-31');
  });

  it('should call rangeSetter when form is submitted', async () => {
    const dateInputCallback = vi.fn();
    const {applyButton, startInput, endInput} = await setupElement({
      dateInputCallback,
    });

    const {start, end} = {
      start: '2023-01-01',
      end: '2023-12-31',
    };

    await userEvent.fill(startInput, start);
    await userEvent.fill(endInput, end);
    await userEvent.click(applyButton);

    expect(dateInputCallback).toHaveBeenCalled();
  });
});
