import {Component} from 'react';
import {
  buildCriterionExpression,
  buildSort,
  Sort as HeadlessSort,
  SortCriterion,
  SortState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

interface SortProps {
  criteria: [string, SortCriterion][];
  initialCriterion: SortCriterion;
}

export class Sort extends Component<SortProps> {
  private controller: HeadlessSort;
  public state: SortState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: SortProps) {
    super(props);

    this.controller = buildSort(engine, {
      initialState: {criterion: props.initialCriterion},
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
