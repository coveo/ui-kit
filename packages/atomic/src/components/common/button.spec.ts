import {createRipple} from '@/src/utils/ripple';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {userEvent} from '@vitest/browser/context';
import {html, nothing} from 'lit';
import {vi, expect, describe, it} from 'vitest';
import {button, ButtonProps} from './button.js';

vi.mock('@/src/utils/ripple', {spy: true});

describe('button', () => {
  const renderButton = async (props: Partial<ButtonProps> = {}) => {
    return fixture(
      html`${button({
        props: {
          text: 'Default test text',
          ...props,
          style: props.style ?? 'primary',
        },
      })(nothing)}`
    );
  };

  it('should render a button in the document', async () => {
    const button = await renderButton();
    expect(button).toBeInTheDocument();
  });

  it('matches known snapshot', async () => {
    const button = await renderButton();
    expect(button).toMatchSnapshot();
  });

  it('should render a button with the correct style', async () => {
    const props: Partial<ButtonProps> = {
      style: 'outline-error',
    };

    const button = await renderButton(props);

    expect(button).toHaveClass('btn-outline-error');
  });

  it('should render a button with the correct text', async () => {
    const props = {
      text: 'Click me',
    };

    const button = await renderButton(props);
    expect(button.querySelector('span')).toHaveTextContent('Click me');
  });

  it('should wrap the button text with a truncate class', async () => {
    const props = {
      text: 'Click me',
    };

    const button = await renderButton(props);

    expect(button.querySelector('span')).toHaveClass('truncate');
  });

  it('should handle click event', async () => {
    const handleClick = vi.fn();
    const props = {
      onClick: handleClick,
    };

    const button = await renderButton(props);

    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it('should apply disabled attribute', async () => {
    const props = {
      disabled: true,
    };

    const button = await renderButton(props);

    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('should apply aria attributes', async () => {
    const props: Partial<ButtonProps> = {
      ariaLabel: 'button',
      ariaPressed: 'true',
    };

    const button = await renderButton(props);

    expect(button.getAttribute('aria-label')).toBe('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should apply custom class', async () => {
    const props = {
      class: 'custom-class',
    };

    const button = await renderButton(props);

    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('btn-primary');
  });

  it('should apply part attribute', async () => {
    const props = {
      part: 'button-part',
    };

    const button = await renderButton(props);

    expect(button.getAttribute('part')).toBe('button-part');
  });

  it('should apply title attribute', async () => {
    const props = {
      title: 'Button Title',
    };

    const button = await renderButton(props);

    expect(button.getAttribute('title')).toBe('Button Title');
  });

  it('should apply tabindex attribute', async () => {
    const props = {
      tabIndex: 1,
    };

    const button = await renderButton(props);

    expect(button.getAttribute('tabindex')).toBe('1');
  });

  it('should apply role attribute', async () => {
    const props: Partial<ButtonProps> = {
      role: 'button',
    };

    const button = await renderButton(props);

    expect(button.getAttribute('role')).toBe('button');
  });

  it('should create a ripple when clicked', async () => {
    const button = await renderButton();

    await userEvent.click(button);

    expect(createRipple).toBeCalled();
  });

  it('should apply form attribute', async () => {
    const props = {
      form: 'form-id',
    };

    const button = await renderButton(props);

    expect(button.getAttribute('form')).toBe('form-id');
  });

  it('should apply type attribute', async () => {
    const props: Partial<ButtonProps> = {
      type: 'submit',
    };

    const button = await renderButton(props);

    expect(button.getAttribute('type')).toBe('submit');
  });
});
