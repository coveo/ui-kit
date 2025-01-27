import {fireEvent, within} from '@storybook/test';
import {html, render} from 'lit';
import {vi} from 'vitest';
import {checkbox, CheckboxProps} from './checkbox';

describe('checkbox', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderCheckbox = (props: Partial<CheckboxProps>): HTMLButtonElement => {
    render(
      html`${checkbox({
        ...props,
        checked: props.checked ?? false,
        onToggle: props.onToggle ?? vi.fn(),
      })}`,
      container
    );
    return within(container).getByRole('checkbox') as HTMLButtonElement;
  };

  it('should render a checkbox with the correct text attributes', () => {
    const props = {
      text: 'Test Checkbox',
      ariaLabel: 'Test Checkbox',
    };

    const button = renderCheckbox(props);

    expect(button).toBeInTheDocument();
    expect(button.getAttribute('aria-label')).toBe('Test Checkbox');
    expect(button.value).toBe('Test Checkbox');
  });

  it('should not be checked by default', async () => {
    const button = renderCheckbox({});

    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(button.classList.contains('selected')).toBe(false);
  });

  it('should be have selected attributes and classes if checked', async () => {
    const button = renderCheckbox({checked: true});

    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(button.classList.contains('selected')).toBe(true);
  });

  it('should call onToggle when the checkbox is clicked', async () => {
    const onToggle = vi.fn();
    const props = {
      onToggle,
    };

    const button = renderCheckbox(props);

    await fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should render a checkbox with the correct class', () => {
    const props = {
      class: 'test-class',
    };

    const button = renderCheckbox(props);

    expect(button).toBeInTheDocument();
    expect(button.classList.contains('test-class')).toBe(true);
  });

  it('should render a checkbox with the correct part attribute', () => {
    const props = {
      part: 'test-part',
    };

    const button = renderCheckbox(props);

    expect(button).toBeInTheDocument();
    expect(button.getAttribute('part')).toBe('test-part');
  });

  it('should render a checkbox with the correct ref', () => {
    const ref = vi.fn();
    const props = {
      ref,
    };

    renderCheckbox(props);

    expect(ref).toHaveBeenCalled();
  });

  it('should render a checkbox with the correct aria-current attribute', () => {
    const props: Partial<CheckboxProps> = {
      ariaCurrent: 'page',
    };

    const button = renderCheckbox(props);

    expect(button).toBeInTheDocument();
    expect(button.getAttribute('aria-current')).toBe('page');
  });

  it('should call onMouseDown when the checkbox is mousedown', async () => {
    const onMouseDown = vi.fn();
    const props = {
      onMouseDown,
    };

    const button = renderCheckbox(props);
    await fireEvent.mouseDown(button);

    expect(onMouseDown).toHaveBeenCalled();
  });
});
