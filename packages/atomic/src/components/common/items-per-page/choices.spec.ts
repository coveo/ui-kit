import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderChoices} from './choices';

describe('#renderChoices', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderChoices({
        props: {
          label: 'Items per page',
          groupName: 'items-per-page',
          pageSize: 10,
          choices: [5, 10, 25, 50],
          lang: 'en',
          scrollToTopEvent: () => ({}),
          setItemSize: () => {},
          focusOnFirstResultAfterNextSearch: () => Promise.resolve(),
          focusOnNextNewResult: () => {},
          ...overrides,
        },
      })}`
    );

    return {
      container: element.querySelector('div[part="buttons"]'),
      radioButtons: element.querySelectorAll('input[type="radio"]'),
      getRadioButtonByValue: (value: string) =>
        element.querySelector(`input[type="radio"][value="${value}"]`),
    };
  };

  it('should render a container with part "buttons"', async () => {
    const {container} = await renderComponent();

    expect(container).toHaveAttribute('part', 'buttons');
  });

  it('should render a radiogroup with the correct aria-label', async () => {
    const {container} = await renderComponent({
      label: 'Custom label',
    });

    expect(container).toHaveAttribute('role', 'radiogroup');
    expect(container).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should render the correct number of radio buttons', async () => {
    const {radioButtons} = await renderComponent({
      choices: [10, 20, 30],
    });

    expect(radioButtons).toHaveLength(3);
  });

  it('should render radio buttons with correct values', async () => {
    const {getRadioButtonByValue} = await renderComponent({
      choices: [5, 10, 25],
    });

    expect(getRadioButtonByValue('5')).toBeInTheDocument();
    expect(getRadioButtonByValue('10')).toBeInTheDocument();
    expect(getRadioButtonByValue('25')).toBeInTheDocument();
  });

  it('should render radio buttons with the correct group name', async () => {
    const {radioButtons} = await renderComponent({
      groupName: 'custom-group',
    });

    radioButtons.forEach((button) => {
      expect(button).toHaveAttribute('name', 'custom-group');
    });
  });

  it('should mark the correct radio button as checked based on pageSize', async () => {
    const {getRadioButtonByValue} = await renderComponent({
      pageSize: 25,
      choices: [5, 10, 25, 50],
    });

    expect(getRadioButtonByValue('25')).toBeChecked();
    expect(getRadioButtonByValue('10')).not.toBeChecked();
    expect(getRadioButtonByValue('50')).not.toBeChecked();
  });

  it('should render radio buttons with correct aria-labels using localized text', async () => {
    const {getRadioButtonByValue} = await renderComponent({
      choices: [1000, 2000],
      lang: 'en-US',
    });

    const button1000 = getRadioButtonByValue('1,000');
    const button2000 = getRadioButtonByValue('2,000');

    expect(button1000).toHaveAttribute('aria-label', '1,000');
    expect(button2000).toHaveAttribute('aria-label', '2,000');
  });

  it('should render active button with correct part attribute', async () => {
    const {getRadioButtonByValue} = await renderComponent({
      pageSize: 10,
      choices: [5, 10, 25],
    });

    const activeButton = getRadioButtonByValue('10');
    expect(activeButton).toHaveAttribute('part', 'button active-button');
  });

  it('should render non-active buttons with correct part attribute', async () => {
    const {getRadioButtonByValue} = await renderComponent({
      pageSize: 10,
      choices: [5, 10, 25],
    });

    const nonActiveButton = getRadioButtonByValue('5');
    expect(nonActiveButton).toHaveAttribute('part', 'button');
  });

  it('should call setItemSize when a radio button is clicked', async () => {
    const setItemSize = vi.fn();
    const {getRadioButtonByValue} = await renderComponent({
      setItemSize,
      choices: [5, 10, 25],
    });

    const button25 = getRadioButtonByValue('25');
    await userEvent.click(button25!);

    expect(setItemSize).toHaveBeenCalledWith(25);
  });

  it('should call focusOnFirstResultAfterNextSearch and scrollToTopEvent when selecting smaller page size', async () => {
    const scrollToTopEvent = vi.fn();
    const focusOnFirstResultAfterNextSearch = vi
      .fn()
      .mockResolvedValue(undefined);

    const {getRadioButtonByValue} = await renderComponent({
      pageSize: 25,
      choices: [5, 10, 25, 50],
      scrollToTopEvent,
      focusOnFirstResultAfterNextSearch,
    });

    const button5 = getRadioButtonByValue('5');
    await userEvent.click(button5!);

    expect(focusOnFirstResultAfterNextSearch).toHaveBeenCalled();
    expect(scrollToTopEvent).toHaveBeenCalled();
  });

  it('should call focusOnNextNewResult when selecting larger page size', async () => {
    const focusOnNextNewResult = vi.fn();

    const {getRadioButtonByValue} = await renderComponent({
      pageSize: 10,
      choices: [5, 10, 25, 50],
      focusOnNextNewResult,
    });

    const button50 = getRadioButtonByValue('50');
    await userEvent.click(button50!);

    expect(focusOnNextNewResult).toHaveBeenCalled();
  });

  it('should not call focus functions when selecting the same page size', async () => {
    const focusOnFirstResultAfterNextSearch = vi.fn();
    const focusOnNextNewResult = vi.fn();
    const scrollToTopEvent = vi.fn();

    const {getRadioButtonByValue} = await renderComponent({
      pageSize: 10,
      choices: [5, 10, 25],
      focusOnFirstResultAfterNextSearch,
      focusOnNextNewResult,
      scrollToTopEvent,
    });

    const button10 = getRadioButtonByValue('10');
    await userEvent.click(button10!);

    expect(focusOnFirstResultAfterNextSearch).not.toHaveBeenCalled();
    expect(focusOnNextNewResult).not.toHaveBeenCalled();
    expect(scrollToTopEvent).not.toHaveBeenCalled();
  });

  it('should handle different locales for number formatting', async () => {
    const {getRadioButtonByValue} = await renderComponent({
      choices: [1000, 5000],
      lang: 'de-DE',
    });

    const button1000 = getRadioButtonByValue('1.000');
    const button5000 = getRadioButtonByValue('5.000');

    expect(button1000).toBeInTheDocument();
    expect(button5000).toBeInTheDocument();
  });
});
