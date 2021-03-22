import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildCriterionExpression,
  Sort as HeadlessSort,
  SortCriterion,
} from '@coveo/headless';

interface SortProps {
  controller: HeadlessSort;
  criteria: [string, SortCriterion][];
}

export const Sort: FunctionComponent<SortProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const getCriterionFromName = (name: string) =>
    props.criteria.find(([criterionName]) => criterionName === name)!;

  const getCurrentCriterion = () =>
    props.criteria.find(
      ([, criterion]) =>
        state.sortCriteria === buildCriterionExpression(criterion)
    )!;

  return (
    <select
      value={getCurrentCriterion()[0]}
      onChange={(e) =>
        controller.sortBy(getCriterionFromName(e.target.value)[1])
      }
    >
      {props.criteria.map(([criterionName]) => (
        <option key={criterionName} value={criterionName}>
          {criterionName}
        </option>
      ))}
    </select>
  );
};

// usage

/**
 * ```tsx
 * const criteria: [string, SortCriterion][] = [
 *   ['Relevance', buildRelevanceSortCriterion()],
 *   ['Date (Ascending)', buildDateSortCriterion(SortOrder.Ascending)],
 *   ['Date (Descending)', buildDateSortCriterion(SortOrder.Descending)],
 *   ['Size (Ascending)', buildFieldSortCriterion('size', SortOrder.Ascending)],
 *   ['Size (Descending)', buildFieldSortCriterion('size', SortOrder.Descending)],
 * ];
 * const initialCriterion = criteria[0][1];
 * const controller = buildSort(engine, {
 *   initialState: {criterion: initialCriterion},
 * });
 *
 * <Sort controller={controller} criteria={criteria} />;
 * ```
 */
