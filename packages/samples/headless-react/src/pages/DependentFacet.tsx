import {
  buildFacet,
  buildSearchEngine,
  Facet as HeadlessFacet,
  getSampleSearchEngineConfiguration,
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
  private parentFacet: HeadlessFacet;
  private dependentFacet: HeadlessFacet;
  constructor(props: {}) {
    super(props);
    this.engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });
    this.parentFacet = buildFacet(this.engine, {
      options: {field: 'objecttype'},
    });
    this.dependentFacet = buildFacet(this.engine, {options: {field: 'author'}});
    this.state = {visibleDependantFacet: false};
  }

  componentDidMount() {
    this.engine.executeFirstSearch();
    this.engine.subscribe(() => {
      const parentActive = this.engine.state.facetSet![
        'objecttype'
      ].currentValues.some((v) => v.state !== 'idle');
      this.setState({visibleDependantFacet: parentActive});
    });
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
            <Facet controller={this.dependentFacet} />
          </div>
        </div>
      </AppContext.Provider>
    );
  }
}
