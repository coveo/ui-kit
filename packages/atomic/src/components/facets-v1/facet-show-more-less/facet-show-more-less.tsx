import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import PlusIcon from 'coveo-styleguide/resources/icons/svg/plus.svg';
import MinusIcon from 'coveo-styleguide/resources/icons/svg/minus.svg';
import {Button} from '../../common/button';

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
  const btnClasses = 'flex items-baseline text-left p-2 text-sm max-w-full';
  const iconClasses = 'w-2 h-2 mr-1';

  if (!props.canShowLessValues && !props.canShowMoreValues) {
    return;
  }

  return (
    <div class="mt-2">
      <Button
        style="text-primary"
        part="show-less"
        class={`${btnClasses} ${props.canShowLessValues ? '' : 'hidden'}`}
        aria-label={showLessFacetValues}
        onClick={() => props.onShowLess()}
      >
        <atomic-icon
          part="show-more-less-icon"
          class={iconClasses}
          icon={MinusIcon}
        ></atomic-icon>
        <span class="truncate">{showLess}</span>
      </Button>
      <Button
        style="text-primary"
        part="show-more"
        class={`${btnClasses} ${props.canShowMoreValues ? '' : 'hidden'}`}
        aria-label={showMoreFacetValues}
        onClick={() => props.onShowMore()}
      >
        <atomic-icon
          part="show-more-less-icon"
          class={iconClasses}
          icon={PlusIcon}
        ></atomic-icon>
        <span class="truncate">{showMore}</span>
      </Button>
    </div>
  );
};
