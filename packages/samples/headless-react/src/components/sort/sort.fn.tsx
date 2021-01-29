import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  Sort as HeadlessSort,
  SortCriterion,
  SortOrder,
} from '@coveo/headless';
import {engine} from '../../engine';

interface SortProps {
  controller: HeadlessSort;
  criterions: {[criterionName: string]: SortCriterion};
}

export const Sort: FunctionComponent<SortProps> = (props) => {
  const {controller} = props;
  const [, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const criterionNames = () => {
    return Object.keys(props.criterions) as (keyof typeof props.criterions)[];
  };

  const sortBy = (criterionName: keyof typeof props.criterions) => {
    controller.sortBy(props.criterions[criterionName]);
  };

  const isSortedBy = (criterionName: keyof typeof props.criterions) => {
    return controller.isSortedBy(props.criterions[criterionName]);
  };

  return (
    <ul>
      {criterionNames().map((criterionName) => (
        <li key={criterionName}>
          <button
            disabled={isSortedBy(criterionName)}
            onClick={() => sortBy(criterionName)}
          >
            {criterionName}
          </button>
        </li>
      ))}
    </ul>
  );
};

// usage

const criterions = {
  Relevance: buildRelevanceSortCriterion(),
  'Date (Ascending)': buildDateSortCriterion(SortOrder.Ascending),
  'Date (Descending)': buildDateSortCriterion(SortOrder.Descending),
  'Size (Ascending)': buildFieldSortCriterion('size', SortOrder.Ascending),
  'Size (Descending)': buildFieldSortCriterion('size', SortOrder.Descending),
  Suggested: buildQueryRankingExpressionSortCriterion(),
  None: buildNoSortCriterion(),
};
const controller = buildSort(engine, {
  initialState: {criterion: criterions.Suggested},
});

<Sort controller={controller} criterions={criterions} />;
