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
        props: {
          ...props,
          checked: props.checked ?? false,
          onToggle: props.onToggle ?? vi.fn(),
        },
      })}`,
      container
    );
    return within(container).getByRole('checkbox') as HTMLButtonElement;
  };

  it('should render a checkbox in the document', () => {
    const props = {};
    const button = renderCheckbox(props);
    expect(button).toBeInTheDocument();
  });

  it('should render a checkbox with the correct text attributes', () => {
    const props = {
      id: 'some_id',
    };

    const button = renderCheckbox(props);

    expect(button?.id).toBe('some_id');
  });

  it('should render a checkbox with the correct text attributes', () => {
    const props = {
      text: 'Test Checkbox',
    };

    const button = renderCheckbox(props);

    expect(button.getAttribute('aria-label')).toBe('Test Checkbox');
    expect(button.value).toBe('Test Checkbox');
  });

  it('should render a checkbox with the correct text attributes', () => {
    const props = {
      text: 'Test Checkbox',
      ariaLabel: 'Aria Label Value',
    };

    const button = renderCheckbox(props);

    expect(button.getAttribute('aria-label')).toBe('Aria Label Value');
    expect(button.value).toBe('Test Checkbox');
  });

  it('should not be checked by default', async () => {
    const button = renderCheckbox({});

    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(button.classList.contains('selected')).toBe(false);
  });

  it('should have selected attributes and classes if checked', async () => {
    const button = renderCheckbox({checked: true});

    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(button.classList.contains('selected')).toBe(true);
  });

  it('should not have selected attributes and classes if not checked', async () => {
    const button = renderCheckbox({checked: false});

    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(button.classList.contains('selected')).toBe(false);
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

    expect(button).toHaveClass('test-class');
    expect(button).toHaveClass(
      'w-4',
      // TODO: KIT-3907
      'h-4',
      'grid',
      'place-items-center',
      'rounded',
      'no-outline',
      'hover:border-primary-light',
      'focus-visible:border-primary-light'
    );
  });

  it('should render a checkbox with the correct part attribute', () => {
    const props = {
      part: 'test-part',
    };

    const button = renderCheckbox(props);

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

    expect(button.getAttribute('aria-current')).toBe('page');
  });

  it('should call onMouseDown when the mousedown event is fired on the checkbox', async () => {
    const onMouseDown = vi.fn();
    const props = {
      onMouseDown,
    };

    const button = renderCheckbox(props);
    await fireEvent.mouseDown(button);

    expect(onMouseDown).toHaveBeenCalled();
  });
});
