import {
  buildFacet,
  buildSearchEngine,
  Facet as HeadlessFacet,
  getSampleSearchEngineConfiguration,
  loadFacetSetActions,
  SearchEngine,
} from '@coveo/headless';
import {Component} from 'react';
import {Facet} from '../components/facet/facet.fn';
import {AppContext} from '../context/engine';

export class DependentFacet extends Component<
  {},
  {visibleDependantFacet: boolean}
> {
  private engine: SearchEngine;
  private facets: HeadlessFacet[];
  constructor(props: {}) {
    super(props);
    this.engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });
    const fields = ['objecttype', 'author', 'source', 'filetype'];
    this.facets = fields.map((field) =>
      buildFacet(this.engine, {options: {field}})
    );
    this.state = {visibleDependantFacet: false};
  }

  componentDidMount() {
    this.engine.executeFirstSearch();
    this.makeDependent();
  }

  render() {
    return (
      <AppContext.Provider value={{engine: this.engine}}>
        <div>
          <h2>Parent facet</h2>
          <Facet controller={this.parentFacet} />
        </div>
        <div>
          <h2>Dependent facet</h2>
          <div
            style={{
              display: this.state.visibleDependantFacet ? 'block' : 'none',
            }}
          >
            {this.dependentFacets.map((childFacet) => (
              <Facet key={childFacet.state.facetId} controller={childFacet} />
            ))}
          </div>
        </div>
      </AppContext.Provider>
    );
  }

  makeDependent() {
    this.parentFacet.subscribe(() => {
      const parentActive = this.parentFacet.state.values.some(
        (v) => v.state !== 'idle'
      );
      if (!parentActive && this.state.visibleDependantFacet) {
        this.dependentFacets.forEach((childFacet) =>
          this.clearChildFacet(childFacet)
        );
      }
      this.setState({visibleDependantFacet: parentActive});
    });
  }

  clearChildFacet(childFacet: HeadlessFacet) {
    loadFacetSetActions(this.engine).deselectAllFacetValues(
      childFacet.state.facetId
    );
  }

  get dependentFacets() {
    return this.facets.slice(1);
  }

  get parentFacet() {
    return this.facets[0];
  }
}
