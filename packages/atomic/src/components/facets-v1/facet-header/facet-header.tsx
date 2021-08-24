import {FunctionalComponent, h} from '@stencil/core';
import ArrowTopIcon from 'coveo-styleguide/resources/icons/svg/arrow-top-rounded.svg';
import ArrowBottomIcon from 'coveo-styleguide/resources/icons/svg/arrow-bottom-rounded.svg';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {i18n} from 'i18next';
import {Button} from '../../common/button';

export const FacetHeader: FunctionalComponent<{
  i18n: i18n;
  label: string;
  numberOfSelectedValues: number;
  isCollapsed: boolean;
  onToggleCollapse(): void;
  onClearFilters?(): void;
}> = (props) => {
  const label = props.i18n.t(props.label);
  const expandFacet = props.i18n.t('expand-facet', {label});
  const collapseFacet = props.i18n.t('collapse-facet', {label});
  const clearFilters = props.i18n.t('clear-filters', {
    count: props.numberOfSelectedValues,
  });
  const clearFiltersForFacet = props.i18n.t('clear-filters-for-facet', {
    count: props.numberOfSelectedValues,
    label,
  });

  return [
    <Button
      style="text-transparent"
      part="label-button"
      class="flex font-bold justify-between w-full py-1 px-2 text-lg"
      title={props.isCollapsed ? expandFacet : collapseFacet}
      onClick={() => props.onToggleCollapse()}
      ariaExpanded={(!props.isCollapsed).toString()}
      text={label}
    >
      <atomic-icon
        part="label-button-icon"
        class="w-3 self-center flex-shrink-0 ml-4"
        icon={props.isCollapsed ? ArrowTopIcon : ArrowBottomIcon}
      ></atomic-icon>
    </Button>,
    props.onClearFilters && props.numberOfSelectedValues > 0 && (
      <Button
        style="text-primary"
        part="clear-button"
        class="flex items-baseline max-w-full p-2 text-sm"
        title={clearFiltersForFacet}
        onClick={() => props.onClearFilters!()}
      >
        <atomic-icon
          part="clear-button-icon"
          class="w-2 h-2 mr-1"
          icon={CloseIcon}
        ></atomic-icon>
        <span>{clearFilters}</span>
      </Button>
    ),
  ];
};
