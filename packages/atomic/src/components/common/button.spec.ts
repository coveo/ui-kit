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

    const element = await renderButton(props);
    const buttonEl = element.querySelector('button');

    expect(buttonEl).toHaveClass('btn-outline-error');
  });

  it('should render a button with the correct text', async () => {
    const props = {
      text: 'Click me',
    };

    const element = await renderButton(props);

    expect(element.querySelector('span')?.textContent).toBe('Click me');
  });

  it('should wrap the button text with a truncate class', async () => {
    const props = {
      text: 'Click me',
    };

    const element = await renderButton(props);

    expect(element.querySelector('span')).toHaveClass('truncate');
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

    const element = await renderButton(props);

    expect(element.querySelector('button')?.hasAttribute('disabled')).toBe(
      true
    );
  });

  it('should apply aria attributes', async () => {
    const props: Partial<ButtonProps> = {
      ariaLabel: 'button',
      ariaPressed: 'true',
    };

    const element = await renderButton(props);
    const buttonEl = element.querySelector('button');

    expect(buttonEl?.getAttribute('aria-label')).toBe('button');
    expect(buttonEl?.getAttribute('aria-pressed')).toBe('true');
  });

  it('should apply custom class', async () => {
    const props = {
      class: 'custom-class',
    };

    const element = await renderButton(props);
    const buttonEl = element.querySelector('button');

    expect(buttonEl).toHaveClass('custom-class');
    expect(buttonEl).toHaveClass('btn-primary');
  });

  it('should apply part attribute', async () => {
    const props = {
      part: 'button-part',
    };

    const element = await renderButton(props);

    expect(element.querySelector('button')?.getAttribute('part')).toBe(
      'button-part'
    );
  });

  it('should apply title attribute', async () => {
    const props = {
      title: 'Button Title',
    };

    const element = await renderButton(props);

    expect(element.querySelector('button')?.getAttribute('title')).toBe(
      'Button Title'
    );
  });

  it('should apply tabindex attribute', async () => {
    const props = {
      tabIndex: 1,
    };

    const element = await renderButton(props);

    expect(element.querySelector('button')?.getAttribute('tabindex')).toBe('1');
  });

  it('should apply role attribute', async () => {
    const props: Partial<ButtonProps> = {
      role: 'button',
    };

    const element = await renderButton(props);

    expect(element.querySelector('button')?.getAttribute('role')).toBe(
      'button'
    );
  });

  it('should call onMouseDown when the mousedown event is fired on the button', async () => {
    const props: Partial<ButtonProps> = {};
    const element = await renderButton(props);
    const buttonEl = element.querySelector('button')!;
    buttonEl.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    expect(createRipple).toHaveBeenCalled();
  });

  it('should apply form attribute', async () => {
    const props = {
      form: 'form-id',
    };

    const element = await renderButton(props);

    expect(element.querySelector('button')?.getAttribute('form')).toBe(
      'form-id'
    );
  });

  it('should apply type attribute', async () => {
    const props: Partial<ButtonProps> = {
      type: 'submit',
    };

    const element = await renderButton(props);

    expect(element.querySelector('button')?.getAttribute('type')).toBe(
      'submit'
    );
  });
});
