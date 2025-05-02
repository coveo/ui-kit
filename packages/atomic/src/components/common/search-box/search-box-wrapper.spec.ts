import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {userEvent} from '@vitest/browser/context';
import {html} from 'lit';
import {vi, expect, describe, it} from 'vitest';
import {renderSearchBoxWrapper} from './search-box-wrapper';

describe('#renderTextAreaClearButton', () => {
  const renderComponent = (overrides = {}) => {
    return renderFunctionFixture(
      html`${renderSearchBoxWrapper({
        props: {
          disabled: false,
          onFocusout: vi.fn(),
          ...overrides,
        },
      })(html`<input />`)}`
    );
  };

  it('should have the "wrapper" part', async () => {
    const element = await renderComponent();
    const wrapper = element.querySelector('[part="wrapper"]');
    await expect.element(wrapper).toHaveAttribute('part', 'wrapper');
  });

  it('should have the correct classes when disabled', async () => {
    const element = await renderComponent({disabled: true});
    const wrapper = element.querySelector('[part="wrapper"]');
    await expect
      .element(wrapper)
      .toHaveClass('focus-within:border-disabled focus-within:ring-neutral');
  });

  it('should have the correct classes when not disabled', async () => {
    const element = await renderComponent({disabled: false});
    const wrapper = element.querySelector('[part="wrapper"]');
    await expect
      .element(wrapper)
      .toHaveClass(
        'focus-within:border-primary focus-within:ring-ring-primary'
      );
  });

  it('should call onFocusout when focus is lost', async () => {
    const onFocusout = vi.fn();
    const element = await renderComponent({onFocusout});
    const input = element.querySelector('input');

    await userEvent.click(input!);
    await userEvent.click(document.body);

    expect(onFocusout).toHaveBeenCalled();
  });

  it('should render children correctly', async () => {
    const element = await renderComponent();
    const input = element.querySelector('input');
    expect(input).toBeTruthy();
  });
});
