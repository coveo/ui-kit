import {Component, ContextType} from 'react';
import {
  buildCriterionExpression,
  buildSort,
  Sort as HeadlessSort,
  SortCriterion,
  SortState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

interface SortProps {
  criteria: [string, SortCriterion][];
  initialCriterion: SortCriterion;
}

export class Sort extends Component<SortProps, SortState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessSort;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildSort(this.context.engine!, {
      initialState: {criterion: this.props.initialCriterion},
    });
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  private getCriterionFromName(name: string) {
    return this.props.criteria.find(
      ([criterionName]) => criterionName === name
    )!;
  }

  private get currentCriterion() {
    return this.props.criteria.find(
      ([, criterion]) =>
        this.state.sortCriteria === buildCriterionExpression(criterion)
    )!;
  }

  render() {
    if (!this.state) {
      return null;
    }

    return (
      <select
        value={this.currentCriterion[0]}
        onChange={(e) =>
          this.controller.sortBy(this.getCriterionFromName(e.target.value)[1])
        }
      >
        {this.props.criteria.map(([criterionName]) => (
          <option key={criterionName} value={criterionName}>
            {criterionName}
          </option>
        ))}
      </select>
    );
  }
}
