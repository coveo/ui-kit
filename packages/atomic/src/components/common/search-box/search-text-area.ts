import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderTextAreaClearButton} from './text-area-clear-button';

interface Props {
  textAreaRef: Ref<HTMLTextAreaElement>;
  loading: boolean;
  i18n: i18n;
  value: string;
  ariaLabel: string;
  title: string;
  onClear(): void;
  popup: {
    id: string;
    activeDescendant: string;
    expanded: boolean;
    hasSuggestions: boolean;
  };
  onInput: (e: Event) => void;
  onFocus: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onChange?: (e: Event) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}

function syncTextWithReplica(ref: Ref<HTMLTextAreaElement>, value?: string) {
  const elem = ref.value;
  const parent = elem?.parentNode as HTMLElement;
  if (!parent || elem?.value === '\n') {
    return;
  }
  parent.dataset.replicatedValue = value ?? elem?.value;
}

function resetReplicaText(ref: Ref<HTMLTextAreaElement>) {
  const elem = ref.value;

  const parent = elem?.parentNode as HTMLElement;
  if (parent) {
    delete parent.dataset.replicatedValue;
  }
}

function collapseTextArea(ref: Ref<HTMLTextAreaElement>) {
  const elem = ref.value;

  const parent = elem?.parentNode as HTMLElement;
  if (parent) {
    parent.classList.remove('expanded');
  }
}

function expandTextArea(ref: Ref<HTMLTextAreaElement>) {
  const elem = ref.value;

  const parent = elem?.parentNode as HTMLElement;
  if (parent) {
    parent.classList.add('expanded');
  }
}

export const renderSearchBoxTextArea: FunctionalComponent<Props> = ({
  props: {
    textAreaRef,
    loading,
    i18n,
    onInput,
    onFocus,
    onBlur,
    onChange,
    onKeyDown,
    onKeyUp,
    value,
    ariaLabel,
    title,
    onClear,
    popup,
  },
}) => {
  return html`<div class="flex grow overflow-hidden">
    <div part="textarea-expander" class="grid grow overflow-hidden">
      <textarea
        title=${title}
        part="textarea"
        aria-label=${ariaLabel}
        placeholder=${i18n.t('search')}
        class="placeholder-neutral-dark"
        rows="1"
        @input=${(e: Event) => {
          onInput?.(e);
          syncTextWithReplica(textAreaRef);
        }}
        @keydown=${(e: KeyboardEvent) => {
          syncTextWithReplica(textAreaRef);
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
          }
          onKeyDown?.(e);
        }}
        @keyup=${(e: KeyboardEvent) => {
          onKeyUp?.(e);
          if (e.key === 'Enter') {
            e.preventDefault();
            return;
          }
          syncTextWithReplica(textAreaRef);
        }}
        @blur=${(e: FocusEvent) => {
          onBlur?.(e);
          collapseTextArea(textAreaRef);
          syncTextWithReplica(textAreaRef);
        }}
        @change=${(e: Event) => {
          onChange?.(e);
          syncTextWithReplica(textAreaRef);
        }}
        @focus=${(e: FocusEvent) => {
          onFocus?.(e);
          const target = e.target as HTMLTextAreaElement;
          syncTextWithReplica(textAreaRef ?? target);
          expandTextArea(textAreaRef ?? target);
        }}
        autocomplete="off"
        autocapitalize="off"
        aria-activedescendant=${ifDefined(popup.activeDescendant)}
        aria-autocomplete="both"
        aria-haspopup="true"
        aria-controls=${popup?.id}
        .value=${value}
        ${ref(textAreaRef)}
      ></textarea>
    </div>
    ${when(
      loading,
      () =>
        html`<div class="ml-2 flex items-center justify-center">
          <span
            part="loading"
            class="loading mr-2 grid h-5 w-5 animate-spin place-items-center rounded-full bg-linear-to-r"
          ></span>
        </div>`
    )}
    ${when(
      !loading && value.length !== 0,
      () =>
        html`${renderTextAreaClearButton({
          props: {
            textAreaRef,
            i18n,
            onClick: () => {
              onClear();
              resetReplicaText(textAreaRef);
            },
          },
        })}`
    )}
  </div>`;
};
