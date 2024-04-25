import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../facet-value-link/facet-value-link';

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
  const partName = `${isParent ? 'active-parent' : ''} ${isLeafValue ? 'leaf-value' : 'node-value'}`;
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
      part={partName}
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
