import {html, nothing} from 'lit';
import {type Ref, ref} from 'lit/directives/ref.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';
import type {SearchBoxSuggestionAction} from './suggestions-types';

interface Props {
  actions: SearchBoxSuggestionAction[];
  actionsRef: Ref<HTMLElement>;
  onSelect(action: SearchBoxSuggestionAction, e: Event): void;
  onFocusTextArea(): void;
  onClose(): void;
}

export const renderSuggestionActions: FunctionalComponent<Props> = ({props}) => {
  if (!props.actions.length) {
    return nothing;
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
      return;
    }

    const isFirstAction = e.target === props.actionsRef.value?.querySelector('button');
    if (e.key === 'Tab' && e.shiftKey && isFirstAction) {
      e.preventDefault();
      props.onFocusTextArea();
    }
  };

  return html`<div
    part="suggestions-actions"
    class="border-neutral flex basis-full flex-wrap gap-2 border-t px-2 py-1"
    ${ref(props.actionsRef)}
    @mousedown=${(e: MouseEvent) => e.preventDefault()}
    @keydown=${onKeyDown}
  >
    ${props.actions.map((action) =>
      renderButton({
        props: {
          style: 'text-primary',
          text: action.label,
          part: action.part ? `suggestions-action ${action.part}` : 'suggestions-action',
          class: 'focus-visible:ring-ring-primary px-2 py-1 focus-visible:ring-2',
          onClick: (e) => props.onSelect(action, e!),
        },
      })(nothing)
    )}
  </div>`;
};

export const focusFirstSuggestionAction = (actionsRef: Ref<HTMLElement>) => {
  const firstAction = actionsRef.value?.querySelector('button');
  firstAction?.focus();
  return !!firstAction;
};
