import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import PlusIcon from 'coveo-styleguide/resources/icons/svg/plus.svg';
import MinusIcon from 'coveo-styleguide/resources/icons/svg/minus.svg';

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
    'w-full flex items-baseline text-left py-2 text-sm mt-2 link';
  const iconClasses = 'fill-current w-2 h-2 mr-1';
  return [
    props.canShowLessValues && (
      <button
        part="show-less"
        class={`show-less ${btnClasses}`}
        aria-label={showLessFacetValues}
        onClick={() => props.onShowLess()}
      >
        <div
          part="show-more-less-icon"
          class={iconClasses}
          innerHTML={MinusIcon}
        ></div>
        {showLess}
      </button>
    ),
    props.canShowMoreValues && (
      <button
        part="show-more"
        class={`show-more ${btnClasses}`}
        aria-label={showMoreFacetValues}
        onClick={() => props.onShowMore()}
      >
        <div
          part="show-more-less-icon"
          class={iconClasses}
          innerHTML={PlusIcon}
        ></div>
        {showMore}
      </button>
    ),
  ];
};
