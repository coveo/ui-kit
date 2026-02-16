import {FunctionalComponent, h} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {AnyBindings} from '../interface/bindings';
import {TextAreaClearButton} from './stencil-text-area-clear-button';

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
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    ...(props.activeDescendant && {
      'aria-activedescendant': props.activeDescendant,
    }),
    'aria-autocomplete': 'both',
    'aria-haspopup': 'true',
    'aria-controls': props.id,
  };
}

function syncTextWithReplica(elem: HTMLTextAreaElement, value?: string) {
  const parent = elem?.parentNode as HTMLElement;
  if (!parent) {
    return;
  }
  if (elem.value === '\n') {
    return;
  }
  parent.dataset.replicatedValue = value ?? elem.value;
}

function resetReplicaText(elem: HTMLTextAreaElement) {
  const parent = elem?.parentNode as HTMLElement;
  if (parent) {
    delete parent.dataset.replicatedValue;
  }
}

function collapseTextArea(elem: HTMLTextAreaElement) {
  const parent = elem?.parentNode as HTMLElement;
  if (parent) {
    parent.classList.remove('expanded');
  }
}

function expandTextArea(elem: HTMLTextAreaElement) {
  const parent = elem?.parentNode as HTMLElement;
  if (parent) {
    parent.classList.add('expanded');
  }
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const SearchTextArea: FunctionalComponent<Props> = ({
  textAreaRef,
  loading,
  bindings,
  onInput,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
  onKeyUp,
  value,
  ariaLabel,
  onClear,
  popup,
  ...defaultInputProps
}) => (
  <div class="flex grow overflow-hidden">
    <div part="textarea-expander" class="grid grow overflow-hidden">
      <textarea
        part="textarea"
        aria-label={ariaLabel}
        placeholder={bindings.i18n.t('search')}
        class="placeholder-neutral-dark"
        rows={1}
        onInput={(e) => {
          onInput?.(e);
          syncTextWithReplica(textAreaRef);
        }}
        onKeyDown={(e) => {
          syncTextWithReplica(textAreaRef);
          if (e.key === 'Enter') {
            if (e.shiftKey) {
              return;
            }
            e.preventDefault();
          }
          onKeyDown?.(e);
        }}
        onKeyUp={(e) => {
          onKeyUp?.(e);
          if (e.key === 'Enter') {
            e.preventDefault();
            return;
          }
          syncTextWithReplica(textAreaRef);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          collapseTextArea(textAreaRef);
          syncTextWithReplica(textAreaRef);
        }}
        onChange={(e) => {
          onChange?.(e);
          syncTextWithReplica(textAreaRef);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          const target = e.target as HTMLTextAreaElement;
          syncTextWithReplica(textAreaRef ?? target);
          expandTextArea(textAreaRef ?? target);
        }}
        autocomplete="off"
        {...(popup && getPopupAttributes(popup))}
        {...defaultInputProps}
        value={value}
      />
    </div>

    {loading && (
      <div class="searchbox-button-wrapper ml-2 flex items-center justify-center">
        <span
          part="loading"
          class="loading mr-2 grid h-5 w-5 animate-spin place-items-center rounded-full bg-linear-to-r"
        ></span>
      </div>
    )}
    {!loading && value && (
      <TextAreaClearButton
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
