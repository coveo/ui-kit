import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import CloseIcon from '../../../../images/close.svg';
import SearchIcon from '../../../../images/search.svg';
import {Button} from '../../stencil-button';

interface FacetSearchInputProps {
  label: string;
  query: string;
  i18n: i18n;
  onClear(): void;
  onChange(value: string): void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetSearchInput: FunctionalComponent<FacetSearchInputProps> = (
  props
) => {
  const label = props.i18n.t(props.label);
  const search = props.i18n.t('facet-search-input');
  const facetSearch = props.i18n.t('facet-search', {label});
  const clear = props.i18n.t('clear');
  let inputRef: HTMLInputElement | undefined;

  return (
    <div class="mt-3 px-2" part="search-wrapper">
      <div class="relative h-10">
        <input
          part="search-input"
          class="input-primary placeholder-neutral-dark group h-full w-full px-9 text-sm"
          type="text"
          placeholder={search}
          aria-label={facetSearch}
          value={props.query}
          onInput={(e) => props.onChange((e.target as HTMLInputElement).value)}
          ref={(ref) => (inputRef = ref)}
        />
        <div class="search-icon text-on-background pointer-events-none absolute left-0 inline-flex h-full w-9 items-center justify-center">
          <atomic-icon part="search-icon" icon={SearchIcon}></atomic-icon>
        </div>
        {props.query !== '' && (
          <Button
            style="text-transparent"
            title={clear}
            class="search-clear-button absolute top-px right-px bottom-px inline-flex w-9 items-center justify-center"
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
