import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {SortCriterion} from '@coveo/headless/commerce';
import {renderSortOption, SortOptionProps} from '../../common/sort/option';

interface CommerceSortOptionProps
  extends Omit<SortOptionProps, 'label' | 'value'> {
  sort: SortCriterion;
}

export const renderCommerceSortOption: FunctionalComponent<
  CommerceSortOptionProps
> = ({props}) => {
  const {sort} = props;
  const label = getLabel(sort);

  return renderSortOption({props: {...props, label, value: label}});
};

export function getLabel(sort: SortCriterion) {
  if (sort.by === 'relevance') {
    return 'relevance';
  } else {
    return sort.fields
      .map((sortByField) => {
        return sortByField.displayName || sortByField.name;
      })
      .join(' ');
  }
}

export function getSortByLabel(label: string, availableSorts: SortCriterion[]) {
  const sortByLabel: Record<string, SortCriterion> = {};
  availableSorts.forEach((availableSort) => {
    sortByLabel[getLabel(availableSort)] = availableSort;
  });

  return sortByLabel[label];
}
