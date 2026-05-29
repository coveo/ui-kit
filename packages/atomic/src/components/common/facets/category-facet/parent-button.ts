import '@/src/components/common/atomic-icon/atomic-icon';
import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import LeftArrow from '../../../../images/arrow-left-rounded.svg';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {renderButton} from '../../button';
import {serializeCategoryFacetTreePath} from './tree-view';

interface CategoryFacetParentButtonProps {
  i18n: i18n;
  field: string;
  facetValue: {value: string; numberOfResults: number; path: string[]};
  onClick: () => void;
  treeLevel: number;
}

export const renderCategoryFacetParentButton: FunctionalComponent<
  CategoryFacetParentButtonProps
> = ({props}) => {
  const displayValue = getFieldValueCaption(
    props.field,
    props.facetValue.value,
    props.i18n
  );
  const ariaLabel = props.i18n.t('facet-value', {
    value: displayValue,
    count: props.facetValue.numberOfResults,
    formattedCount: props.facetValue.numberOfResults.toLocaleString(
      props.i18n.language
    ),
  });

  return renderButton({
    props: {
      style: 'text-neutral',
      part: 'parent-button',
      role: 'treeitem',
      ariaExpanded: 'true',
      ariaLevel: props.treeLevel,
      ariaPressed: 'false',
      onClick: () => {
        props.onClick();
      },
      ariaLabel: ariaLabel,
      dataTreeKind: 'parent',
      dataTreePath: serializeCategoryFacetTreePath(props.facetValue.path),
    },
  })(html`
    <atomic-icon
      icon=${LeftArrow}
      part="back-arrow"
      class="back-arrow"
    ></atomic-icon>
    <span class="truncate">${displayValue}</span>
  `);
};

export type {CategoryFacetParentButtonProps};
