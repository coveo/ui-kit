import {FunctionalComponent, h} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {AnyBindings} from '../interface/bindings';
import {ClearButton} from './clear-button';

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
  const parent = elem.parentNode;
  if (parent) {
    (parent as HTMLElement).dataset.replicatedValue = elem.value;
  }
}

function collapseTextArea(elem: HTMLTextAreaElement) {
  const parent = elem.parentNode;
  if (parent) {
    (parent as HTMLElement).classList.remove('expanded');
  }
}

function expandTextArea(elem: HTMLTextAreaElement) {
  const parent = elem.parentNode;
  if (parent) {
    (parent as HTMLElement).classList.add('expanded');
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
  <div class="grow flex items-center overflow-hidden">
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
          syncTextWithReplica(e.target as HTMLTextAreaElement);
        }}
        onBlur={(e) => {
          collapseTextArea(e.target as HTMLTextAreaElement);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          expandTextArea(e.target as HTMLTextAreaElement);
        }}
        autocomplete="off"
        {...(popup && getPopupAttributes(popup))}
        {...defaultInputProps}
        value={value}
      />
    </div>

    {loading && (
      <span
        part="loading"
        class="loading w-5 h-5 rounded-full bg-gradient-to-r animate-spin mr-3 grid place-items-center"
      ></span>
    )}
    {!loading && value && (
      <ClearButton
        inputRef={textAreaRef}
        bindings={bindings}
        onClick={() => {
          onClear();
          syncTextWithReplica(textAreaRef);
        }}
      />
    )}
  </div>
);
