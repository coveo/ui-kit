import {FunctionalComponent, h} from '@stencil/core';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {i18n} from 'i18next';

interface FacetSearchInputProps {
  label: string;
  query: string;
  i18n: i18n;
}

export const FacetSearchInput: FunctionalComponent<FacetSearchInputProps> = (
  props
) => {
  const label = props.i18n.t(props.label);
  const search = props.i18n.t('search');
  const facetSearch = props.i18n.t('facetSearch', {label});
  const clear = props.i18n.t('clear');

  return (
    <div class="relative h-10 w-full">
      <input
        part="search-input"
        class="w-full h-full border border-neutral rounded pl-9 placeholder-neutral-dark text-sm focus:border-primary focus:outline-none"
        type="text"
        placeholder={search}
        aria-label={facetSearch}
        value={props.query}
      ></input>
      <div class="input-ring w-full h-full absolute inset-0 pointer-events-none rounded opacity-40"></div>
      <div
        part="search-icon"
        class="search-icon pointer-events-none absolute inline-flex justify-center items-center left-0 w-9 h-full text-on-background"
      >
        <div class="fill-current" innerHTML={SearchIcon}></div>
      </div>
      <button
        title={clear}
        part="search-clear-button"
        class="search-clear-button absolute border border-transparent inline-flex justify-center items-center right-0 w-9 h-full text-on-background rounded focus:outline-none focus:text-primary hover:text-primary focus:border-primary"
      >
        <div class="fill-current" innerHTML={CloseIcon}></div>
      </button>
    </div>
  );
};
