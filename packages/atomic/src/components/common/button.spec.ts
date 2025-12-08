import {html, nothing} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {createRipple} from '@/src/utils/ripple-utils';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type ButtonProps, renderButton as button} from './button';

vi.mock('@/src/utils/ripple-utils', {spy: true});

describe('#renderButton', () => {
  const locators = {
    get button() {
      return page.getByRole('button');
    },
    get span() {
      return page.getByRole('button').getByText(/./);
    },
  };

  const renderButton = async (
    props: Partial<ButtonProps>
  ): Promise<HTMLElement> => {
    return renderFunctionFixture(
      html`${button({
        props: {
          ...props,
          style: props.style ?? 'primary',
        },
      })(nothing)}`
    );
  };

  it('should render a button in the document', async () => {
    await renderButton({});
    await expect.element(locators.button).toBeInTheDocument();
  });

  it('should render a button with the correct style', async () => {
    const props: Partial<ButtonProps> = {
      style: 'outline-error',
    };

    await renderButton(props);

    await expect.element(locators.button).toHaveClass('btn-outline-error');
  });

  it('should render a button with the correct text', async () => {
    const props = {
      text: 'Click me',
    };

    await renderButton(props);

    await expect
      .element(locators.button.getByText('Click me'))
      .toBeInTheDocument();
  });

  it('should wrap the button text with a truncate class', async () => {
    const props = {
      text: 'Click me',
    };

    const element = await renderButton(props);
    const span = element.querySelector('span');

    expect(span).toHaveClass('truncate');
  });

  it('should handle click event', async () => {
    const handleClick = vi.fn();
    const props = {
      onClick: handleClick,
    };

    const element = await renderButton(props);
    const buttonEl = element.querySelector('button')!;

    buttonEl.click();

    expect(handleClick).toHaveBeenCalled();
  });

  it('should apply disabled attribute', async () => {
    const props = {
      disabled: true,
    };

    await renderButton(props);

    await expect.element(locators.button).toBeDisabled();
  });

  it('should apply aria attributes', async () => {
    const props: Partial<ButtonProps> = {
      ariaLabel: 'button',
      ariaPressed: 'true',
    };

    await renderButton(props);

    await expect
      .element(locators.button)
      .toHaveAttribute('aria-label', 'button');
    await expect
      .element(locators.button)
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('should apply custom class', async () => {
    const props = {
      class: 'custom-class',
    };

    await renderButton(props);

    await expect.element(locators.button).toHaveClass('custom-class');
    await expect.element(locators.button).toHaveClass('btn-primary');
  });

  it('should apply part attribute', async () => {
    const props = {
      part: 'button-part',
    };

    await renderButton(props);

    await expect
      .element(locators.button)
      .toHaveAttribute('part', 'button-part');
  });

  it('should apply title attribute', async () => {
    const props = {
      title: 'Button Title',
    };

    await renderButton(props);

    await expect
      .element(locators.button)
      .toHaveAttribute('title', 'Button Title');
  });

  it('should apply tabindex attribute', async () => {
    const props = {
      tabIndex: 1,
    };

    await renderButton(props);

    await expect.element(locators.button).toHaveAttribute('tabindex', '1');
  });

  it('should apply role attribute', async () => {
    const props: Partial<ButtonProps> = {
      role: 'button',
    };

    await renderButton(props);

    await expect.element(locators.button).toHaveAttribute('role', 'button');
  });

  it('should call onMouseDown when the mousedown event is fired on the button', async () => {
    const props: Partial<ButtonProps> = {};
    await renderButton(props);
    const buttonEl = locators.button.element();
    buttonEl.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    expect(createRipple).toHaveBeenCalled();
  });

  it('should apply form attribute', async () => {
    const props = {
      form: 'form-id',
    };

    await renderButton(props);

    await expect.element(locators.button).toHaveAttribute('form', 'form-id');
  });

  it('should apply type attribute', async () => {
    const props: Partial<ButtonProps> = {
      type: 'submit',
    };

    await renderButton(props);

    await expect.element(locators.button).toHaveAttribute('type', 'submit');
  });
});
