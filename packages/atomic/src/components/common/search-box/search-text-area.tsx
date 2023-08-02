import {FunctionalComponent, h} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {AnyBindings} from '../interface/bindings';
import {ClearButton} from './clear-button';

interface Props extends JSXBase.InputHTMLAttributes<HTMLTextAreaElement> {
  inputRef: HTMLInputElement;
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

function resizeTextArea(elem: HTMLElement) {
  const startingHeight = '1em';
  if (elem) {
    elem.style.height = startingHeight;
    elem.style.height = `${elem.scrollHeight}px`;
  }
}

export const SearchTextArea: FunctionalComponent<Props> = ({
  inputRef,
  loading,
  bindings,
  onKeyDown,
  value,
  ariaLabel,
  onClear,
  popup,
  ...defaultInputProps
}) => (
  <div class="grow flex items-center">
    <textarea
      part="textarea"
      aria-label={ariaLabel}
      placeholder={bindings.i18n.t('search')}
      class="h-full resize-none outline-none bg-transparent w-0 grow px-4 py-3.5 text-neutral-dark placeholder-neutral-dark text-lg"
      onKeyDown={(e) => {
        onKeyDown?.(e);
        resizeTextArea(e.target as HTMLElement);
      }}
      autocomplete="off"
      {...(popup && getPopupAttributes(popup))}
      {...defaultInputProps}
      value={value}
    />
    {loading && (
      <span
        part="loading"
        class="loading w-5 h-5 rounded-full bg-gradient-to-r animate-spin mr-3 grid place-items-center"
      ></span>
    )}
    {!loading && value && (
      <ClearButton
        inputRef={inputRef}
        bindings={bindings}
        onClick={() => {
          onClear();
        }}
      />
    )}
  </div>
);
