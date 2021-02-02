import {Component} from 'react';
import {
  buildFacet,
  Facet as HeadlessFacet,
  FacetActions,
  FacetState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

interface FacetProps {
  field: string;
  facetId: string;
}

export class Facet extends Component<FacetProps> {
  private controller: HeadlessFacet;
  public state: FacetState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: FacetProps) {
    super(props);
    if (process.env.NODE_ENV === 'development') {
      // When `React.StrictMode` is active in development, the constructor is executed twice.
      // This ensures the facet isn't already defined from a previous execution.
      engine.dispatch(FacetActions.removeFacet(this.props.facetId));
    }

    this.controller = buildFacet(engine, {options: {field: props.field}});
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
    this.controller.showMoreValues();
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.controller.remove();
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
