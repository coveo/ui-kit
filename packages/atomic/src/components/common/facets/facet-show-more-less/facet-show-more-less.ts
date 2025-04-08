import {i18n} from 'i18next';
import {html} from 'lit';
import MinusIcon from '../../../../images/minus.svg';
import PlusIcon from '../../../../images/plus.svg';
import '../../atomic-icon/atomic-icon';
import {button} from '../../button';

interface FacetShowMoreProps {
  label: string;
  i18n: i18n;
  canShowLessValues: boolean;
  canShowMoreValues: boolean;
  onShowMore(): void;
  onShowLess(): void;
  showMoreRef?: (element?: HTMLButtonElement) => void;
  showLessRef?: (element?: HTMLButtonElement) => void;
}

export const facetShowMoreLess = (props: FacetShowMoreProps) => {
  const label = props.i18n.t(props.label);
  const showMore = props.i18n.t('show-more');
  const showMoreFacetValues = props.i18n.t('show-more-facet-values', {
    label,
  });
  const showLess = props.i18n.t('show-less');
  const showLessFacetValues = props.i18n.t('show-less-facet-values', {
    label,
  });
  const btnClasses = 'flex items-baseline text-left p-2 text-sm max-w-full';
  const iconClasses = 'w-2 h-2 mr-1';
  if (!props.canShowLessValues && !props.canShowMoreValues) {
    return;
  }

  return html`<div class="mt-2">
    ${button({
      props: {
        style: 'text-primary',
        part: 'show-less',
        class: `${btnClasses} ${props.canShowLessValues ? '' : 'hidden'}`,
        ariaLabel: showLessFacetValues,
        onClick: () => props.onShowLess(),
        // ref: props.showLessRef,
        //  TODO: add ref
      },
    })(
      html`<atomic-icon
          part="show-more-less-icon"
          class=${iconClasses}
          icon=${MinusIcon}
        ></atomic-icon>
        <span class="truncate">${showLess}</span>`
    )}
    ${button({
      props: {
        style: 'text-primary',
        part: 'show-more',
        class: `${btnClasses} ${props.canShowMoreValues ? '' : 'hidden'}`,
        ariaLabel: showMoreFacetValues,
        onClick: () => props.onShowMore(),
        // ref: props.showMoreRef,
        //  TODO: add ref
      },
    })(
      html`<atomic-icon
          part="show-more-less-icon"
          class=${iconClasses}
          icon=${PlusIcon}
        ></atomic-icon>
        <span class="truncate">${showMore}</span>`
    )}
  </div>`;
};
