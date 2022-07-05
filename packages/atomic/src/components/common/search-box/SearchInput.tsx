import {JSXBase} from '@stencil/core/internal';
import {SearchBox, SearchBoxState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {AnyBindings} from '../interface/bindings';
import {ClearButton} from './ClearButton';

interface Props extends JSXBase.InputHTMLAttributes<HTMLInputElement> {
  inputRef: HTMLInputElement;
  loading: boolean;
  bindings: AnyBindings;
  state: SearchBoxState;
  searchBox: SearchBox;
  disabled: boolean;
  ariaOwns?: string;
  isExpanded?: string;
  activeDescendant?: string;
}

export const SearchInput: FunctionalComponent<Props> = ({
  inputRef,
  loading,
  bindings,
  state,
  searchBox,
  disabled,
  onKeyDown,
  ...defaultInputProps
}) => (
  <div class="grow flex items-center">
    <input
      value={state.value}
      part="input"
      aria-label={bindings.i18n.t('search-box')}
      aria-autocomplete="both"
      aria-haspopup="true"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      placeholder={bindings.i18n.t('search')}
      type="text"
      class="h-full outline-none bg-transparent w-0 grow px-4 py-3.5 text-neutral-dark placeholder-neutral-dark text-lg"
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (disabled) {
          return;
        }

        switch (e.key) {
          case 'Enter':
            searchBox.submit();
            break;
        }
      }}
      {...defaultInputProps}
    />
    {loading && (
      <span
        part="loading"
        class="loading w-5 h-5 rounded-full bg-gradient-to-r animate-spin mr-3 grid place-items-center"
      ></span>
    )}
    {!loading && state.value && (
      <ClearButton
        inputRef={inputRef}
        bindings={bindings}
        searchBox={searchBox}
      />
    )}
  </div>
);
