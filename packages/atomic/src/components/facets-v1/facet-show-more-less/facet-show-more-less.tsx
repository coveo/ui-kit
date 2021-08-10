import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import PlusIcon from 'coveo-styleguide/resources/icons/svg/plus.svg';
import MinusIcon from 'coveo-styleguide/resources/icons/svg/minus.svg';
import {createRipple} from '../../../utils/ripple';

interface FacetShowMoreProps {
  label: string;
  i18n: i18n;
  canShowLessValues: boolean;
  canShowMoreValues: boolean;
  onShowMore(): void;
  onShowLess(): void;
}

export const FacetShowMoreLess: FunctionalComponent<FacetShowMoreProps> = (
  props
) => {
  const label = props.i18n.t(props.label);
  const showMore = props.i18n.t('show-more');
  const showMoreFacetValues = props.i18n.t('show-more-facet-values', {
    label,
  });
  const showLess = props.i18n.t('show-less');
  const showLessFacetValues = props.i18n.t('show-less-facet-values', {
    label,
  });
  const btnClasses =
    'flex items-baseline text-left p-2 text-sm mt-2 max-w-full text-primary rounded hover:text-primary focus:text-primary hover:bg-neutral-light focus:bg-neutral-light focus:outline-color';
  const iconClasses = 'fill-current w-2 h-2 mr-1';
  return [
    props.canShowLessValues && (
      <button
        part="show-less"
        class={`show-less ${btnClasses}`}
        aria-label={showLessFacetValues}
        onClick={() => props.onShowLess()}
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
      >
        <div
          part="show-more-less-icon"
          class={iconClasses}
          innerHTML={MinusIcon}
        ></div>
        <span class="truncate">{showLess}</span>
      </button>
    ),
    props.canShowMoreValues && (
      <button
        part="show-more"
        class={`show-more ${btnClasses}`}
        aria-label={showMoreFacetValues}
        onClick={() => props.onShowMore()}
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
      >
        <div
          part="show-more-less-icon"
          class={iconClasses}
          innerHTML={PlusIcon}
        ></div>
        <span class="truncate">{showMore}</span>
      </button>
    ),
  ];
};
