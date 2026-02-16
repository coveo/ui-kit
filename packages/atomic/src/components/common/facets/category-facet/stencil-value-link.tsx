import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/stencil-facet-value-label-highlight';
import {FacetValueLink} from '../facet-value-link/stencil-facet-value-link';

/**
 * @deprecated should only be used for Stencil components.
 */
export interface CategoryFacetValueLinkProps {
  displayValue: string;
  numberOfResults: number;
  i18n: i18n;
  onClick: () => void;
  isParent: boolean;
  isSelected: boolean;
  searchQuery: string;
  isLeafValue: boolean;
  setRef: (el?: HTMLButtonElement) => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CategoryFacetValueLink: FunctionalComponent<
  CategoryFacetValueLinkProps
> = (
  {
    displayValue,
    numberOfResults,
    i18n,
    onClick,
    isParent,
    isSelected,
    searchQuery,
    isLeafValue,
    setRef,
  },
  children
) => {
  const partNames = [];
  if (isParent) {
    partNames.push('active-parent');
  } else {
    partNames.push(`value-link${isSelected ? ' value-link-selected' : ''}`);
  }

  if (isLeafValue) {
    partNames.push('leaf-value');
  } else {
    partNames.push('node-value');
  }

  return (
    <FacetValueLink
      displayValue={displayValue}
      numberOfResults={numberOfResults}
      isSelected={isSelected}
      i18n={i18n}
      onClick={() => {
        onClick();
      }}
      searchQuery={searchQuery}
      part={partNames.join(' ')}
      class="contents"
      buttonRef={(btn) => setRef(btn)}
      subList={children}
    >
      <FacetValueLabelHighlight
        displayValue={displayValue}
        isSelected={isSelected}
      ></FacetValueLabelHighlight>
    </FacetValueLink>
  );
};
