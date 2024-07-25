import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import ArrowBottomIcon from '../../../../images/arrow-bottom-rounded.svg';
import ArrowTopIcon from '../../../../images/arrow-top-rounded.svg';
import CloseIcon from '../../../../images/close.svg';
import {Button} from '../../button';
import {Heading} from '../../heading';

export interface FacetHeaderProps {
  i18n: i18n;
  label: string;
  numberOfActiveValues: number;
  isCollapsed: boolean;
  headingLevel: number;
  onToggleCollapse(): void;
  onClearFilters?(): void;
  headerRef?: (element?: HTMLButtonElement) => void;
}

export const FacetHeader: FunctionalComponent<FacetHeaderProps> = (props) => {
  const label = props.i18n.t(props.label);
  const expandFacet = props.i18n.t('expand-facet', {label});
  const collapseFacet = props.i18n.t('collapse-facet', {label});
  const clearFilters = props.i18n.t('clear-filters', {
    count: props.numberOfActiveValues,
  });
  const clearFiltersForFacet = props.i18n.t('clear-filters-for-facet', {
    count: props.numberOfActiveValues,
    label,
  });

  return [
    <Button
      style="text-transparent"
      part="label-button"
      class="flex font-bold justify-between w-full py-1 px-2 text-lg rounded-none"
      ariaLabel={props.isCollapsed ? expandFacet : collapseFacet}
      onClick={() => props.onToggleCollapse()}
      ariaExpanded={(!props.isCollapsed).toString()}
      ref={props.headerRef}
    >
      <Heading level={props.headingLevel} class="truncate">
        {label}
      </Heading>
      <atomic-icon
        part="label-button-icon"
        class="w-3 self-center shrink-0 ml-4"
        icon={props.isCollapsed ? ArrowBottomIcon : ArrowTopIcon}
      ></atomic-icon>
    </Button>,
    props.onClearFilters && props.numberOfActiveValues > 0 && (
      <Button
        style="text-primary"
        part="clear-button"
        class="flex items-baseline max-w-full p-2 text-sm"
        ariaLabel={clearFiltersForFacet}
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
