import {FunctionalComponent, h} from '@stencil/core';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {i18n} from 'i18next';

interface FacetSearchInputProps {
  label: string;
  query: string;
  i18n: i18n;
  onClear(): void;
  onChange(value: string): void;
}

export const FacetSearchInput: FunctionalComponent<FacetSearchInputProps> = (
  props
) => {
  const label = props.i18n.t(props.label);
  const search = props.i18n.t('search');
  const facetSearch = props.i18n.t('facet-search', {label});
  const clear = props.i18n.t('clear');
  let inputRef: HTMLInputElement | undefined;

  return (
    <div class="px-2 mt-3">
      <div class="relative h-10">
        <input
          part="search-input"
          class="input-primary w-full h-full px-9 placeholder-neutral-dark text-sm group"
          type="text"
          placeholder={search}
          aria-label={facetSearch}
          value={props.query}
          onInput={(e) => props.onChange((e.target as HTMLInputElement).value)}
          ref={(ref) => (inputRef = ref)}
        />
        <div
          part="search-icon"
          class="search-icon pointer-events-none absolute inline-flex justify-center items-center left-0 w-9 h-full text-on-background"
        >
          <div class="fill-current" innerHTML={SearchIcon}></div>
        </div>
        {props.query !== '' && (
          <button
            title={clear}
            part="search-clear-button"
            class="search-clear-button absolute border border-transparent inline-flex justify-center items-center right-0 w-9 h-full text-on-background rounded focus:text-primary hover:text-primary focus:outline-color"
            onClick={() => {
              props.onClear();
              inputRef!.focus();
            }}
          >
            <div class="fill-current" innerHTML={CloseIcon}></div>
          </button>
        )}
      </div>
    </div>
  );
};
