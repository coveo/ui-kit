import {FunctionalComponent, h} from '@stencil/core';
import ArrowTopIcon from 'coveo-styleguide/resources/icons/svg/arrow-top-rounded.svg';
import ArrowBottomIcon from 'coveo-styleguide/resources/icons/svg/arrow-bottom-rounded.svg';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {i18n} from 'i18next';

export const FacetHeader: FunctionalComponent<{
  i18n: i18n;
  label: string;
  numberOfSelectedValues: number;
  isCollapsed: boolean;
  onToggleCollapse(): void;
  onClearFilters(): void;
}> = (props) => {
  const label = props.i18n.t(props.label);
  const expandFacet = props.i18n.t('expandFacet', {label});
  const collapseFacet = props.i18n.t('collapseFacet', {label});
  const clearFilters = props.i18n.t('clearFilters', {
    count: props.numberOfSelectedValues,
  });
  const clearFiltersForFacet = props.i18n.t('clearFiltersForFacet', {
    count: props.numberOfSelectedValues,
    label,
  });

  return [
    <button
      part="label-button"
      class="flex justify-between w-full py-1 text-on-background text-lg hover:text-primary"
      title={props.isCollapsed ? expandFacet : collapseFacet}
      onClick={() => props.onToggleCollapse()}
    >
      <span class="ellipsed">{label}</span>
      <span
        part="label-button-icon"
        class="fill-current w-3 h-2 self-center flex-shrink-0 ml-4"
        innerHTML={props.isCollapsed ? ArrowTopIcon : ArrowBottomIcon}
      ></span>
    </button>,
    props.numberOfSelectedValues > 0 && (
      <button
        part="clear-button"
        class="flex w-full p-1 text-secondary hover:text-secondary-light text-sm"
        title={clearFiltersForFacet}
        onClick={() => props.onClearFilters()}
      >
        <span
          part="clear-button-icon"
          class="fill-current w-2 h-2 self-center mr-1"
          innerHTML={CloseIcon}
        ></span>
        <span>{clearFilters}</span>
      </button>
    ),
  ];
};
