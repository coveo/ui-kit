import {Component} from 'react';
import {
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  Sort as HeadlessSort,
  SortOrder,
  SortState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

const criterions = {
  Relevance: buildRelevanceSortCriterion(),
  'Date (Ascending)': buildDateSortCriterion(SortOrder.Ascending),
  'Date (Descending)': buildDateSortCriterion(SortOrder.Descending),
  'Size (Ascending)': buildFieldSortCriterion('size', SortOrder.Ascending),
  'Size (Descending)': buildFieldSortCriterion('size', SortOrder.Descending),
  Suggested: buildQueryRankingExpressionSortCriterion(),
  None: buildNoSortCriterion(),
};

export class Sort extends Component {
  private controller: HeadlessSort;
  public state: SortState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildSort(engine, {
      initialState: {criterion: criterions.Suggested},
    });
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private get criterionNames() {
    return Object.keys(criterions) as (keyof typeof criterions)[];
  }

  private sortBy(criterionName: keyof typeof criterions) {
    this.controller.sortBy(criterions[criterionName]);
  }

  private isSortedBy(criterionName: keyof typeof criterions) {
    return this.controller.isSortedBy(criterions[criterionName]);
  }

  render() {
    return (
      <ul>
        {this.criterionNames.map((criterionName) => (
          <li key={criterionName}>
            <button
              disabled={this.isSortedBy(criterionName)}
              onClick={() => this.sortBy(criterionName)}
            >
              {criterionName}
            </button>
          </li>
        ))}
      </ul>
    );
  }
}
