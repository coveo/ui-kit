import {Component, ContextType} from 'react';
import {
  buildFacet,
  Facet as HeadlessFacet,
  FacetOptions,
  FacetState,
  Unsubscribe,
} from '@coveo/headless';
import {FacetSearch} from './facet-search';
import {AppContext} from '../../context/engine';

interface FacetProps extends FacetOptions {
  facetId: string;
}

export class Facet extends Component<FacetProps, FacetState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessFacet;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildFacet(this.context.engine!, {
      options: this.props,
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

  render() {
    if (!this.state) {
      return null;
    }

    if (!this.state.values.length) {
      return <div>No facet values</div>;
    }

    return (
      <ul>
        <li>
          <FacetSearch
            controller={this.controller.facetSearch}
            facetState={this.state.facetSearch}
            isValueSelected={(facetSearchValue) =>
              !!this.state.values.find(
                (facetValue) =>
                  facetValue.value === facetSearchValue.displayValue &&
                  this.controller.isValueSelected(facetValue)
              )
            }
          />
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
