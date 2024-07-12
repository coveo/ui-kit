import {SortCriterion} from '@coveo/headless/commerce';
import {FunctionalComponent, h} from '@stencil/core';
import {SortOption, SortOptionProps} from '../../common/sort/option';

interface CommerceSortOptionProps
  extends Omit<SortOptionProps, 'label' | 'value'> {
  sort: SortCriterion;
}
export const CommerceSortOption: FunctionalComponent<
  CommerceSortOptionProps
> = (props) => {
  const {sort} = props;
  const label = getLabel(sort);

  return <SortOption {...props} label={label} value={label} />;
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
