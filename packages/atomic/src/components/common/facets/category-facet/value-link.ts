import type {i18n} from 'i18next';
import type {TemplateResult} from 'lit';
import {html} from 'lit';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '@/src/components/common/facets/facet-value-link/facet-value-link';
import type {FunctionalComponentWithOptionalChildren} from '@/src/utils/functional-component-utils';
import {serializeCategoryFacetTreePath} from './tree-view';

type CategoryFacetTreeItemKind = 'active-parent' | 'value';

export interface CategoryFacetValueLinkProps {
  displayValue: string;
  numberOfResults: number;
  i18n: i18n;
  onClick: () => void;
  isParent: boolean;
  isSelected: boolean;
  searchQuery: string;
  isLeafValue: boolean;
  setRef: (el?: Element) => void;
  treeLevel: number;
  treePath: string[];
  treeKind?: CategoryFacetTreeItemKind;
  isExpanded?: boolean;
}

export const renderCategoryFacetValueLink: FunctionalComponentWithOptionalChildren<
  CategoryFacetValueLinkProps
> =
  ({
    props: {
      displayValue,
      numberOfResults,
      i18n,
      onClick,
      isParent,
      isSelected,
      searchQuery,
      isLeafValue,
      setRef,
      treeLevel,
      treePath,
      treeKind = 'value',
      isExpanded,
    },
  }) =>
  (children?) => {
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

    return html`${renderFacetValueLink({
      props: {
        displayValue,
        numberOfResults,
        i18n,
        onClick,
        isSelected,
        searchQuery,
        part: partNames.join(' '),
        class: 'contents',
        role: 'treeitem',
        ariaLevel: treeLevel,
        ariaExpanded: isLeafValue ? undefined : isExpanded ? 'true' : 'false',
        dataTreeKind: treeKind,
        dataTreePath: serializeCategoryFacetTreePath(treePath),
        buttonRef: (element) => {
          setRef?.(element);
        },
        subList: children as TemplateResult,
      },
    })(
      renderFacetValueLabelHighlight({
        props: {
          displayValue,
          searchQuery,
          isSelected,
        },
      })
    )}`;
  };
