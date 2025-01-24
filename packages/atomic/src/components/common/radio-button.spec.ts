import {fireEvent, within} from '@storybook/test';
import {html, render} from 'lit';
import {vi} from 'vitest';
import {radioButton, RadioButtonProps} from './radio-button';

describe('radioButton', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderRadioButton = (
    props: Partial<RadioButtonProps>
  ): HTMLInputElement => {
    render(
      html`${radioButton({...props, groupName: 'test-group'})}`,
      container
    );
    return within(container).getByRole('radio');
  };

  it('should render a radio button with the correct attributes', () => {
    const props = {
      text: 'Test Radio Button',
      checked: true,
      ariaLabel: 'Test Radio Button',
    };

    const input = renderRadioButton(props);

    expect(input).toBeInTheDocument();
    expect(input.name).toBe('test-group');
    expect(input.checked).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Test Radio Button');
    expect(input.value).toBe('Test Radio Button');
    expect(input.classList.contains('selected')).toBe(true);
  });

  it('should call onChecked when the radio button is checked', async () => {
    const onChecked = vi.fn();
    const props = {
      onChecked,
    };

    const input = renderRadioButton(props);
    await fireEvent.click(input);

    expect(onChecked).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', async () => {
    const {focus, keyDown} = fireEvent;
    const getRadio = (index: number) =>
      within(container).getByLabelText(`radio-${index}`);
    const props = {
      groupName: 'test-group',
      selectWhenFocused: false,
    };

    render(
      html`${radioButton({...props, text: 'radio-1'})}
      ${radioButton({...props, text: 'radio-2'})}
      ${radioButton({...props, text: 'radio-3'})}`,
      container
    );

    const inputs = within(container).getAllByRole('radio');

    await focus(inputs[0]);
    await keyDown(inputs[0], {key: 'ArrowRight'});

    expect(getRadio(1)).toBeInTheDocument();

    keyDown(inputs[1], {key: 'ArrowRight'});
    expect(getRadio(2)).toBeInTheDocument();

    keyDown(inputs[2], {key: 'ArrowRight'});
    expect(getRadio(3)).toBeInTheDocument();
  });

  // it('should create a ripple effect on mousedown', () => {
  //   const createRipple = vi.fn();
  //   const props = {
  //
  //     style: 'primary',
  //   };

  //   render(html`${radioButton(props)}`, container);

  //   const input = container.querySelector(
  //     'input[type="radio"]'
  //   ) as HTMLInputElement;
  //   input.dispatchEvent(new MouseEvent('mousedown'));

  //   expect(createRipple).toHaveBeenCalled();
  // });

  it('should render a radio button with the correct class', async () => {
    const props = {
      class: 'test-class',
    };

    const input = renderRadioButton(props);
    expect(input).toBeInTheDocument();
    // TODO: better use story book tests
    expect(input.classList.contains('test-class')).toBe(true);
    expect(input.classList.contains('btn-radio')).toBe(true);
    expect(input.classList.contains('selected')).toBe(false);
  });

  it('should render a radio button with the correct part attribute', () => {
    const props = {
      part: 'test-part',
    };

    const input = renderRadioButton(props);
    expect(input).toBeInTheDocument();
    expect(input.getAttribute('part')).toBe('test-part');
  });

  it('should render a radio button with the correct ref', () => {
    const ref = vi.fn();
    const props = {
      groupName: 'test-group',
      ref,
    };

    render(html`${radioButton(props)}`, container);

    expect(ref).toHaveBeenCalled();
  });

  it('should render a radio button with the correct aria-current attribute', () => {
    const props: Partial<RadioButtonProps> = {
      ariaCurrent: 'page',
    };

    const input = renderRadioButton(props);
    expect(input).toBeInTheDocument();
    expect(input.getAttribute('aria-current')).toBe('page');
  });
});
