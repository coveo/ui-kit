import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import LeftArrow from '../../../../images/arrow-left-rounded.svg';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {Button} from '../../stencil-button';

interface CategoryFacetParentButtonProps {
  i18n: i18n;
  field: string;
  facetValue: {value: string; numberOfResults: number};
  onClick: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetParentButton: FunctionalComponent<
  CategoryFacetParentButtonProps
> = ({field, facetValue, i18n, onClick}) => {
  const displayValue = getFieldValueCaption(field, facetValue.value, i18n);
  const ariaLabel = i18n.t('facet-value', {
    value: displayValue,
    count: facetValue.numberOfResults,
    formattedCount: facetValue.numberOfResults.toLocaleString(i18n.language),
  });

  return (
    <Button
      style="text-neutral"
      part="parent-button"
      ariaPressed="false"
      onClick={() => {
        onClick();
      }}
      ariaLabel={ariaLabel}
    >
      <atomic-icon
        icon={LeftArrow}
        part="back-arrow"
        class="back-arrow"
      ></atomic-icon>
      <span class="truncate">{displayValue}</span>
    </Button>
  );
};
