import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderSearchBoxWrapper} from './search-box-wrapper';

describe('#renderTextAreaClearButton', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderSearchBoxWrapper({
        props: {
          disabled: false,
          onFocusout: vi.fn(),
          ...overrides,
        },
      })(html`<input />`)}`
    );

    return {
      wrapper: element.querySelector('[part="wrapper"]'),
      input: element.querySelector('input'),
    };
  };

  it('should have the "wrapper" part', async () => {
    const {wrapper} = await renderComponent();
    expect(wrapper).toHaveAttribute('part', 'wrapper');
  });

  it('should have the correct classes when disabled', async () => {
    const {wrapper} = await renderComponent({disabled: true});
    expect(wrapper).toHaveClass(
      'focus-within:border-disabled focus-within:ring-neutral'
    );
  });

  it('should have the correct classes when not disabled', async () => {
    const {wrapper} = await renderComponent({disabled: false});
    expect(wrapper).toHaveClass(
      'focus-within:border-primary focus-within:ring-ring-primary'
    );
  });

  it('should call onFocusout when focus is lost', async () => {
    const onFocusout = vi.fn();
    const {input} = await renderComponent({onFocusout});

    await userEvent.click(input!);
    await userEvent.click(document.body);

    expect(onFocusout).toHaveBeenCalled();
  });

  it('should render children', async () => {
    const {input} = await renderComponent();
    expect(input).toBeTruthy();
  });
});
