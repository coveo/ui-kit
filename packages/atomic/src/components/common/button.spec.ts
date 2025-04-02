import {createRipple} from '@/src/utils/ripple';
import {fireEvent, within} from '@storybook/test';
import {html, render} from 'lit';
import {vi} from 'vitest';
import {button, ButtonProps} from './button';

vi.mock('@/src/utils/ripple', () => ({
  createRipple: vi.fn(),
}));

describe('button', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderButton = (props: Partial<ButtonProps>): HTMLButtonElement => {
    render(
      html`${button({
        props: {
          ...props,
          style: props.style ?? 'primary',
        },
        children: html``,
      })}`,
      container
    );
    return within(container).getByRole('button') as HTMLButtonElement;
  };

  it('should render a button in the document', () => {
    const props = {};
    const button = renderButton(props);
    expect(button).toBeInTheDocument();
  });

  it('should render a button with the correct style', () => {
    const props: Partial<ButtonProps> = {
      style: 'outline-error',
    };

    const button = renderButton(props);

    expect(button).toHaveClass('btn-outline-error');
  });

  it('should render a button with the correct text', () => {
    const props = {
      text: 'Click me',
    };

    const button = renderButton(props);

    expect(button.querySelector('span')?.textContent).toBe('Click me');
  });

  it('should wrap the button text with a truncate class', () => {
    const props = {
      text: 'Click me',
    };

    const button = renderButton(props);

    expect(button.querySelector('span')).toHaveClass('truncate');
  });

  it('should handle click event', async () => {
    const handleClick = vi.fn();
    const props = {
      onClick: handleClick,
    };

    const button = renderButton(props);

    await fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it('should apply disabled attribute', () => {
    const props = {
      disabled: true,
    };

    const button = renderButton(props);

    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('should apply aria attributes', () => {
    const props: Partial<ButtonProps> = {
      ariaLabel: 'button',
      ariaPressed: 'true',
    };

    const button = renderButton(props);

    expect(button.getAttribute('aria-label')).toBe('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should apply custom class', () => {
    const props = {
      class: 'custom-class',
    };

    const button = renderButton(props);

    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('btn-primary');
  });

  it('should apply part attribute', () => {
    const props = {
      part: 'button-part',
    };

    const button = renderButton(props);

    expect(button.getAttribute('part')).toBe('button-part');
  });

  it('should apply title attribute', () => {
    const props = {
      title: 'Button Title',
    };

    const button = renderButton(props);

    expect(button.getAttribute('title')).toBe('Button Title');
  });

  it('should apply tabindex attribute', () => {
    const props = {
      tabIndex: 1,
    };

    const button = renderButton(props);

    expect(button.getAttribute('tabindex')).toBe('1');
  });

  it('should apply role attribute', () => {
    const props: Partial<ButtonProps> = {
      role: 'button',
    };

    const button = renderButton(props);

    expect(button.getAttribute('role')).toBe('button');
  });

  it('should call onMouseDown when the mousedown event is fired on the button', async () => {
    const props: Partial<ButtonProps> = {};
    const button = renderButton(props);
    await fireEvent.mouseDown(button);
    expect(createRipple).toHaveBeenCalled();
  });

  it('should apply form attribute', () => {
    const props = {
      form: 'form-id',
    };

    const button = renderButton(props);

    expect(button.getAttribute('form')).toBe('form-id');
  });

  it('should apply type attribute', () => {
    const props: Partial<ButtonProps> = {
      type: 'submit',
    };

    const button = renderButton(props);

    expect(button.getAttribute('type')).toBe('submit');
  });
});
