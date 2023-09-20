import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import CloseIcon from '../../../../images/close.svg';
import SearchIcon from '../../../../images/search.svg';
import {Button} from '../../button';

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
  const search = props.i18n.t('facet-search-input');
  const facetSearch = props.i18n.t('facet-search', {label});
  const clear = props.i18n.t('clear');
  let inputRef: HTMLInputElement | undefined;

  return (
    <div class="px-2 mt-3" part="search-wrapper">
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
        <div class="search-icon pointer-events-none absolute inline-flex justify-center items-center left-0 w-9 h-full text-on-background">
          <atomic-icon part="search-icon" icon={SearchIcon}></atomic-icon>
        </div>
        {props.query !== '' && (
          <Button
            style="text-transparent"
            title={clear}
            class="search-clear-button absolute inline-flex justify-center items-center right-px w-9 top-px bottom-px"
            onClick={() => {
              props.onClear();
              inputRef!.focus();
            }}
          >
            <atomic-icon
              part="search-clear-button"
              icon={CloseIcon}
            ></atomic-icon>
          </Button>
        )}
      </div>
    </div>
  );
};
