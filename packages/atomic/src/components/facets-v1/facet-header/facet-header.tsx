import {FunctionalComponent, h} from '@stencil/core';
import ArrowTopIcon from 'coveo-styleguide/resources/icons/svg/arrow-top-rounded.svg';
import ArrowBottomIcon from 'coveo-styleguide/resources/icons/svg/arrow-bottom-rounded.svg';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';

interface FacetHeaderProps {
  label: string;
  collapseAria: string;
  clearFilters: string;
  clearFiltersAria: string;
  isCollapsed: boolean;
  hasActiveValues: boolean;
  onToggleCollapse(): void;
  onClearFilters(): void;
}

export const FacetHeader: FunctionalComponent<FacetHeaderProps> = (props) => {
  return [
    <button
      part="label-button"
      class="flex justify-between w-full py-1 text-on-background hover:text-primary"
      title={props.collapseAria}
      onClick={() => props.onToggleCollapse()}
    >
      <span class="ellipsed">{props.label}</span>
      <span
        part="label-button-icon"
        class="fill-current w-3 h-2 self-center flex-shrink-0 ml-4"
        innerHTML={props.isCollapsed ? ArrowTopIcon : ArrowBottomIcon}
      ></span>
    </button>,
    props.hasActiveValues && (
      <button
        part="clear-button"
        class="flex w-full p-1 text-secondary hover:text-secondary-light text-xs"
        title={props.clearFiltersAria}
        onClick={() => props.onClearFilters()}
      >
        <span
          part="clear-button-icon"
          class="fill-current w-2 h-2 self-center mr-1"
          innerHTML={CloseIcon}
        ></span>
        <span>{props.clearFilters}</span>
      </button>
    ),
  ];
};
