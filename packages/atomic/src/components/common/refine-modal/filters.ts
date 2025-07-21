import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import type {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';

interface RefineModalFiltersSectionProps {
  i18n: i18n;
  withFacets: boolean;
  withAutomaticFacets: boolean;
}

export const renderRefineModalFiltersSection: FunctionalComponentWithChildren<
  RefineModalFiltersSectionProps
> =
  ({props}) =>
  (children) => {
    return html`
      <div part="filter-section" class="mt-8 mb-3 flex w-full justify-between">
        <h2
          part="section-title section-filters-title"
          class="truncate text-2xl font-bold"
        >
          ${props.i18n.t('filters')}
        </h2>
        ${children}
      </div>
      ${when(props.withFacets, () => html`<slot name="facets"></slot>`)}
      ${when(
        props.withAutomaticFacets,
        () => html`<slot name="automatic-facets"></slot>`
      )}
    `;
  };

interface RefineModalFiltersClearButtonProps {
  i18n: i18n;
  onClick: () => void;
}

export const renderRefineModalFiltersClearButton: FunctionalComponent<
  RefineModalFiltersClearButtonProps
> = ({props}) => {
  return html`${renderButton({
    props: {
      onClick: props.onClick,
      style: 'text-primary',
      text: props.i18n.t('clear'),
      class: 'px-2 py-1',
      part: 'filter-clear-all',
    },
  })(nothing)}`;
};
