import {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {createRef, ref} from 'lit/directives/ref.js';
import CloseIcon from '../../../../images/close.svg';
import SearchIcon from '../../../../images/search.svg';
import '../../atomic-icon/atomic-icon';
import {renderButton} from '../../button';

const inputRef = createRef<HTMLInputElement>();

interface FacetSearchInputProps {
  label: string;
  query: string;
  i18n: i18n;
  onClear(): void;
  onChange(value: string): void;
}

export const renderFacetSearchInput = (props: FacetSearchInputProps) => {
  const label = props.i18n.t(props.label);
  const search = props.i18n.t('facet-search-input');
  const facetSearch = props.i18n.t('facet-search', {label});
  const clear = props.i18n.t('clear');

  return html`
    <div class="mt-3 px-2" part="search-wrapper">
      <div class="relative h-10">
        <input
          ${ref(inputRef)}
          part="search-input"
          class="input-primary placeholder-neutral-dark group h-full w-full px-9 text-sm"
          type="text"
          placeholder=${search}
          aria-label=${facetSearch}
          .value=${props.query}
          @input=${(e: Event) =>
            props.onChange((e.target as HTMLInputElement).value)}
        />
        <div
          class="search-icon text-on-background pointer-events-none absolute left-0 inline-flex h-full w-9 items-center justify-center"
        >
          <atomic-icon part="search-icon" .icon=${SearchIcon}></atomic-icon>
        </div>
        ${props.query !== ''
          ? html`
              ${renderButton({
                props: {
                  style: 'text-transparent',
                  title: clear,
                  class:
                    'search-clear-button absolute top-px right-px bottom-px inline-flex w-9 items-center justify-center',
                  onClick: () => {
                    props.onClear();
                    // TODO: check if can target input without having to query selectors
                    // const input = document.querySelector(
                    //   'input[part="search-input"]'
                    // ) as HTMLInputElement;
                    // input?.focus();
                    inputRef.value?.focus();
                  },
                },
              })(
                // TODO: check if icons are always computed
                html`<atomic-icon
                  part="search-clear-button"
                  .icon=${CloseIcon}
                ></atomic-icon>`
              )}
            `
          : nothing}
      </div>
    </div>
  `;
};
