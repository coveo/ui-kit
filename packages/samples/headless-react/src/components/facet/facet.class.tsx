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
  facetId: string;
}

export class Facet extends Component<FacetProps> {
  private controller: HeadlessFacet;
  public state: FacetState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: FacetProps) {
    super(props);

    this.controller = buildFacet(engine, {
      options: {field: props.field, facetId: props.facetId},
    });
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

  private onInput(text: string) {
    this.controller.facetSearch.updateText(text);
    this.controller.facetSearch.search();
  }

  render() {
    if (!this.state.values.length) {
      return <div>No facet values</div>;
    }

    return (
      <ul>
        <li>
          <input onInput={(e) => this.onInput(e.currentTarget.value)} />
          <ul>
            {this.state.facetSearch.values.map((facetSearchValue) => (
              <li key={facetSearchValue.rawValue}>
                <button
                  onClick={() =>
                    this.controller.facetSearch.select(facetSearchValue)
                  }
                  disabled={
                    !!this.state.values.find(
                      (facetValue) =>
                        facetValue.value === facetSearchValue.displayValue &&
                        this.controller.isValueSelected(facetValue)
                    )
                  }
                >
                  {facetSearchValue.displayValue} ({facetSearchValue.count}{' '}
                  results)
                </button>
              </li>
            ))}
          </ul>
        </li>
        <li>
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
        </li>
      </ul>
    );
  }
}
