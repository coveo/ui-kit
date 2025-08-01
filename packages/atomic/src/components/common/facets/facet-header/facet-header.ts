import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import ArrowBottomIcon from '../../../../images/arrow-bottom-rounded.svg';
import ArrowTopIcon from '../../../../images/arrow-top-rounded.svg';
import CloseIcon from '../../../../images/close.svg';
import '../../atomic-icon/atomic-icon';
import {renderButton} from '../../button';
import {renderHeading} from '../../heading';

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

export const renderFacetHeader: FunctionalComponent<FacetHeaderProps> = ({
  props,
}) => {
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

  return html`
    ${renderButton({
      props: {
        part: 'label-button',
        style: 'text-transparent',
        class:
          'flex w-full justify-between rounded-none px-2 py-1 text-lg font-bold',
        ariaLabel: props.isCollapsed ? expandFacet : collapseFacet,
        onClick: props.onToggleCollapse,
        ariaExpanded: props.isCollapsed ? 'false' : 'true',
        ref: (el) => props.headerRef?.(el as HTMLButtonElement),
      },
    })(
      html`${renderHeading({
        props: {level: props.headingLevel, class: 'truncate'},
      })(html`${label}`)}
        <atomic-icon
          part="label-button-icon"
          class="ml-4 w-3 shrink-0 self-center"
          .icon=${props.isCollapsed ? ArrowBottomIcon : ArrowTopIcon}
        ></atomic-icon>`
    )}
    ${when(
      props.onClearFilters && props.numberOfActiveValues > 0,
      () =>
        html`${renderButton({
          props: {
            part: 'clear-button',
            style: 'text-primary',
            class: 'flex max-w-full items-baseline p-2 text-sm',
            ariaLabel: clearFiltersForFacet,
            onClick: props.onClearFilters,
          },
        })(
          html`<atomic-icon
              part="clear-button-icon"
              class="mr-1 h-2 w-2"
              .icon=${CloseIcon}
            ></atomic-icon>
            <span>${clearFilters}</span>`
        )}`,
      () => nothing
    )}
  `;
};
