import {html} from 'lit';
import {createRef} from 'lit/directives/ref.js';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {focusFirstSuggestionAction, renderSuggestionActions} from './suggestion-actions';
import type {SearchBoxSuggestionAction} from './suggestions-types';

const buildAction = (
  overrides: Partial<SearchBoxSuggestionAction> = {}
): SearchBoxSuggestionAction => ({
  label: 'Action',
  onSelect: vi.fn(),
  ...overrides,
});

const renderComponent = async (
  props: Partial<Parameters<typeof renderSuggestionActions>[0]['props']> = {}
) => {
  const mergedProps = {
    actions: [buildAction()],
    actionsRef: createRef<HTMLElement>(),
    onSelect: vi.fn(),
    onFocusTextArea: vi.fn(),
    onClose: vi.fn(),
    ...props,
  };
  const element = await renderFunctionFixture(
    html`${renderSuggestionActions({props: mergedProps})}`
  );

  return {
    props: mergedProps,
    container: element.querySelector<HTMLElement>('[part="suggestions-actions"]'),
    buttons: Array.from(element.querySelectorAll('button')),
  };
};

describe('#renderSuggestionActions', () => {
  it('should render nothing when there are no actions', async () => {
    const {container} = await renderComponent({actions: []});

    expect(container).toBeNull();
  });

  it('should render a button for each action', async () => {
    const {buttons} = await renderComponent({
      actions: [buildAction({label: 'First'}), buildAction({label: 'Second'})],
    });

    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['First', 'Second']);
  });

  it('should add the "suggestions-action" part and the action part to the button', async () => {
    const {buttons} = await renderComponent({actions: [buildAction({part: 'custom-part'})]});

    expect(buttons[0]).toHaveAttribute('part', 'suggestions-action custom-part');
  });

  it('should only add the "suggestions-action" part when the action has no part', async () => {
    const {buttons} = await renderComponent();

    expect(buttons[0]).toHaveAttribute('part', 'suggestions-action');
  });

  it('should assign the container to the actions ref', async () => {
    const {container, props} = await renderComponent();

    expect(props.actionsRef.value).toBe(container);
  });

  it('should call #onSelect with the action when a button is clicked', async () => {
    const action = buildAction();
    const {buttons, props} = await renderComponent({actions: [action]});

    await userEvent.click(buttons[0]);

    expect(props.onSelect).toHaveBeenCalledWith(action, expect.any(MouseEvent));
  });

  it('should prevent the default behavior of mousedown to keep the focus where it is', async () => {
    const {buttons} = await renderComponent();
    const event = new MouseEvent('mousedown', {bubbles: true, cancelable: true});

    buttons[0].dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('should call #onClose when Escape is pressed on an action', async () => {
    const {buttons, props} = await renderComponent();

    buttons[0].focus();
    await userEvent.keyboard('{Escape}');

    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('should call #onFocusTextArea when Shift+Tab is pressed on the first action', async () => {
    const {buttons, props} = await renderComponent();

    buttons[0].focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

    expect(props.onFocusTextArea).toHaveBeenCalledOnce();
  });

  it('should not call #onFocusTextArea when Shift+Tab is pressed on another action', async () => {
    const {buttons, props} = await renderComponent({actions: [buildAction(), buildAction()]});

    buttons[1].focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

    expect(props.onFocusTextArea).not.toHaveBeenCalled();
  });
});

describe('#focusFirstSuggestionAction', () => {
  it('should focus the first action and return true when there are actions', async () => {
    const {buttons, props} = await renderComponent({actions: [buildAction(), buildAction()]});

    const result = focusFirstSuggestionAction(props.actionsRef);

    expect(result).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('should return false when there are no actions', async () => {
    const {props} = await renderComponent({actions: []});

    expect(focusFirstSuggestionAction(props.actionsRef)).toBe(false);
  });
});
