import {FunctionalComponent, h} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {AnyBindings} from '../interface/bindings';
import {NewClearButton} from './new-clear-button';

interface Props extends JSXBase.TextareaHTMLAttributes<HTMLTextAreaElement> {
  textAreaRef: HTMLTextAreaElement;
  loading: boolean;
  bindings: AnyBindings;
  value: string;
  ariaLabel: string;
  onClear(): void;
  popup?: {
    id: string;
    activeDescendant: string;
    expanded: boolean;
    hasSuggestions: boolean;
  };
}

function getPopupAttributes(props: Required<Props>['popup']) {
  return {
    role: 'combobox',
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    'aria-activedescendant': props.activeDescendant,
    'aria-expanded': `${props.hasSuggestions && props.expanded}`,
    'aria-autocomplete': 'both',
    'aria-haspopup': 'true',
    'aria-controls': props.id,
  };
}

function syncTextWithReplica(elem: HTMLTextAreaElement) {
  const parent = elem.parentNode as HTMLElement;
  if (elem.value === '\n') {
    return;
  }
  if (parent) {
    parent.dataset.replicatedValue = elem.value;
  }
}

function resetReplicaText(elem: HTMLTextAreaElement) {
  const parent = elem.parentNode as HTMLElement;
  if (parent) {
    delete parent.dataset.replicatedValue;
  }
}

function collapseTextArea(elem: HTMLTextAreaElement) {
  const parent = elem.parentNode as HTMLElement;
  if (parent) {
    parent.classList.remove('expanded');
  }
}

function expandTextArea(elem: HTMLTextAreaElement) {
  const parent = elem.parentNode as HTMLElement;
  if (parent) {
    parent.classList.add('expanded');
  }
}

export const SearchTextArea: FunctionalComponent<Props> = ({
  textAreaRef,
  loading,
  bindings,
  onInput,
  onFocus,
  onKeyDown,
  value,
  ariaLabel,
  onClear,
  popup,
  ...defaultInputProps
}) => (
  <div class="grow flex overflow-hidden">
    <div class="grow-wrap grow grid overflow-hidden">
      <textarea
        part="textarea"
        aria-label={ariaLabel}
        placeholder={bindings.i18n.t('search')}
        class="placeholder-neutral-dark"
        rows={1}
        onInput={(e) => {
          onInput?.(e);
          syncTextWithReplica(e.target as HTMLTextAreaElement);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (['Enter', 'Tab'].includes(e.key)) {
            e.preventDefault();
            return;
          }
          syncTextWithReplica(e.target as HTMLTextAreaElement);
        }}
        onBlur={(e) => {
          collapseTextArea(e.target as HTMLTextAreaElement);
        }}
        onChange={(e) => {
          syncTextWithReplica(e.target as HTMLTextAreaElement);
        }}
        onFocus={(e) => {
          const target = e.target as HTMLTextAreaElement;
          onFocus?.(e);
          expandTextArea(target);
        }}
        autocomplete="off"
        {...(popup && getPopupAttributes(popup))}
        {...defaultInputProps}
        value={value}
      />
    </div>

    {loading && (
      <div class="searchbox-button-wrapper flex items-center justify-center ml-2">
        <span
          part="loading"
          class="loading w-5 h-5 rounded-full bg-gradient-to-r animate-spin mr-2 grid place-items-center"
        ></span>
      </div>
    )}
    {!loading && value && (
      <NewClearButton
        inputRef={textAreaRef}
        bindings={bindings}
        onClick={() => {
          onClear();
          resetReplicaText(textAreaRef);
        }}
      />
    )}
  </div>
);
