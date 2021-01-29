import {Component} from 'react';
import {
  buildFacet,
  Facet as HeadlessFacet,
  FacetState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

interface FacetProps {
  field: string;
}

export class Facet extends Component<FacetProps> {
  private controller: HeadlessFacet;
  public state: FacetState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: FacetProps) {
    super(props);

    this.controller = buildFacet(engine, {options: {field: props.field}});
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
    this.controller.showMoreValues();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state.values.length) {
      return <div>No facet values</div>;
    }

    return (
      <ul>
        {this.state.values.map((value) => (
          <li key={value.value}>
            <input
              type="checkbox"
              checked={this.controller.isValueSelected(value)}
              onChange={() => this.controller.toggleSelect(value)}
              disabled={this.state.isLoading}
            />
            {value.value} ({value.numberOfResults} results)
          </li>
        ))}
      </ul>
    );
  }
}
