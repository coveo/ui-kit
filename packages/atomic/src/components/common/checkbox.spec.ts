import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type CheckboxProps, renderCheckbox as checkbox} from './checkbox';

describe('#renderCheckbox', () => {
  const locators = {
    get checkbox() {
      return page.getByRole('checkbox');
    },
  };

  const renderCheckbox = async (
    props: Partial<CheckboxProps>
  ): Promise<HTMLElement> => {
    return renderFunctionFixture(
      html`${checkbox({
        props: {
          ...props,
          checked: props.checked ?? false,
          onToggle: props.onToggle ?? vi.fn(),
        },
      })}`
    );
  };

  it('should render a checkbox in the document', async () => {
    await renderCheckbox({});
    await expect.element(locators.checkbox).toBeInTheDocument();
  });

  it('should set the correct id attribute', async () => {
    const props = {
      id: 'some_id',
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]');

    expect(button?.id).toBe('some_id');
  });

  it('should use text as aria-label and value when ariaLabel is not provided', async () => {
    const props = {
      text: 'Test Checkbox',
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]')!;

    expect(button.getAttribute('aria-label')).toBe('Test Checkbox');
    expect((button as HTMLButtonElement).value).toBe('Test Checkbox');
  });

  it('should prioritize ariaLabel over text for aria-label attribute', async () => {
    const props = {
      text: 'Test Checkbox',
      ariaLabel: 'Aria Label Value',
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]')!;

    expect(button.getAttribute('aria-label')).toBe('Aria Label Value');
    expect((button as HTMLButtonElement).value).toBe('Test Checkbox');
  });

  it('should not be checked by default', async () => {
    const element = await renderCheckbox({});
    const button = element.querySelector('button[role="checkbox"]')!;

    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(button.classList.contains('selected')).toBe(false);
  });

  it('should have selected attributes and classes if checked', async () => {
    const element = await renderCheckbox({checked: true});
    const button = element.querySelector('button[role="checkbox"]')!;

    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(button.classList.contains('selected')).toBe(true);
  });

  it('should not display an icon if not checked', async () => {
    const element = await renderCheckbox({checked: false});
    const button = element.querySelector('button[role="checkbox"]')!;
    const icon = button.querySelector('atomic-icon');

    expect(window.getComputedStyle(icon!).display).toBe('none');
  });

  it('should display an icon if checked', async () => {
    const element = await renderCheckbox({checked: true});
    const button = element.querySelector('button[role="checkbox"]')!;
    const icon = button.querySelector('atomic-icon');
    await customElements.whenDefined('atomic-icon');

    expect(window.getComputedStyle(icon!).display).toBe('block');
  });

  it('should not have selected attributes and classes if not checked', async () => {
    const element = await renderCheckbox({checked: false});
    const button = element.querySelector('button[role="checkbox"]')!;

    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(button.classList.contains('selected')).toBe(false);
  });

  it('should call onToggle when the checkbox is clicked', async () => {
    const onToggle = vi.fn();
    const props = {
      onToggle,
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]')!;

    button.click();

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should render a checkbox with the correct class', async () => {
    const props = {
      class: 'test-class',
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]')!;

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

  it('should render a checkbox with the correct part attribute', async () => {
    const props = {
      part: 'test-part',
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]')!;

    expect(button.getAttribute('part')).toBe('test-part');
  });

  it('should render a checkbox with the correct ref', async () => {
    const ref = vi.fn();
    const props = {
      ref,
    };

    await renderCheckbox(props);

    expect(ref).toHaveBeenCalled();
  });

  it('should render a checkbox with the correct aria-current attribute', async () => {
    const props: Partial<CheckboxProps> = {
      ariaCurrent: 'page',
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]')!;

    expect(button.getAttribute('aria-current')).toBe('page');
  });

  it('should call onMouseDown when the mousedown event is fired on the checkbox', async () => {
    const onMouseDown = vi.fn();
    const props = {
      onMouseDown,
    };

    const element = await renderCheckbox(props);
    const button = element.querySelector('button[role="checkbox"]')!;
    button.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

    expect(onMouseDown).toHaveBeenCalled();
  });
});
