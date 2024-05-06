import {FunctionalComponent, h} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {AnyBindings} from '../interface/bindings';
import {ClearButton} from './clear-button';

interface Props extends JSXBase.InputHTMLAttributes<HTMLInputElement> {
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
    ...(props.activeDescendant && {
      'aria-activedescendant': props.activeDescendant,
    }),
    'aria-expanded': `${props.hasSuggestions && props.expanded}`,
    'aria-autocomplete': 'both',
    'aria-haspopup': 'true',
    'aria-controls': props.id,
  };
}

export const SearchInput: FunctionalComponent<Props> = ({
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
    <input
      part="input"
      aria-label={ariaLabel}
      placeholder={bindings.i18n.t('search')}
      type="text"
      class="h-full outline-none bg-transparent w-0 grow px-4 py-3.5 text-neutral-dark placeholder-neutral-dark text-lg"
      onKeyDown={(e) => {
        onKeyDown?.(e);
      }}
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
        onClick={() => onClear()}
      />
    )}
  </div>
);
