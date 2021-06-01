import {FunctionalComponent, h} from '@stencil/core';
import ArrowTopIcon from 'coveo-styleguide/resources/icons/svg/arrow-top-rounded.svg';
import ArrowBottomIcon from 'coveo-styleguide/resources/icons/svg/arrow-bottom-rounded.svg';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {I18nState} from '../../../utils/initialization-utils';
import {i18n} from 'i18next';

interface FacetHeaderStringsOptions {
  stringsState: I18nState;
  i18n: i18n;
  label: string;
}

export function loadFacetHeaderStrings({
  stringsState,
  i18n,
  label,
}: FacetHeaderStringsOptions) {
  stringsState.label = () => i18n.t(label);
  stringsState.clearFilters = (variables) =>
    i18n.t('clearFilters', {
      count: variables?.count,
    });
  stringsState.clearFiltersForFacet = (variables) =>
    i18n.t('clearFiltersForFacet', {
      count: variables?.count,
      label: stringsState.label(),
    });
  stringsState.collapseFacet = () =>
    i18n.t('collapseFacet', {
      label: stringsState.label(),
    });
  stringsState.expandFacet = () =>
    i18n.t('expandFacet', {
      label: stringsState.label(),
    });
}

interface FacetHeaderProps {
  stringsState: I18nState;
  numberOfSelectedValues: number;
  isCollapsed: boolean;
  onToggleCollapse(): void;
  onClearFilters(): void;
}

export const FacetHeader: FunctionalComponent<FacetHeaderProps> = ({
  isCollapsed,
  numberOfSelectedValues,
  onClearFilters,
  onToggleCollapse,
  stringsState,
}) => [
  <button
    part="label-button"
    class="flex justify-between w-full py-1 text-on-background hover:text-primary"
    title={
      isCollapsed ? stringsState.expandFacet() : stringsState.collapseFacet()
    }
    onClick={() => onToggleCollapse()}
  >
    <span class="ellipsed">{stringsState.label()}</span>
    <span
      part="label-button-icon"
      class="fill-current w-3 h-2 self-center flex-shrink-0 ml-4"
      innerHTML={isCollapsed ? ArrowTopIcon : ArrowBottomIcon}
    ></span>
  </button>,
  numberOfSelectedValues > 0 && (
    <button
      part="clear-button"
      class="flex w-full p-1 text-secondary hover:text-secondary-light text-xs"
      title={stringsState.clearFiltersForFacet({count: numberOfSelectedValues})}
      onClick={() => onClearFilters()}
    >
      <span
        part="clear-button-icon"
        class="fill-current w-2 h-2 self-center mr-1"
        innerHTML={CloseIcon}
      ></span>
      <span>{stringsState.clearFilters({count: numberOfSelectedValues})}</span>
    </button>
  ),
];
