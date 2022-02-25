import {
  buildFacet,
  buildFacetDependenciesManager,
  buildSearchEngine,
  Facet as HeadlessFacet,
  FacetDependenciesManager,
  getSampleSearchEngineConfiguration,
  SearchEngine,
} from '@coveo/headless';
import {Component} from 'react';
import {Facet} from '../components/facet/facet.fn';

export class DependentFacetPage extends Component {
  private engine: SearchEngine;
  private dependenciesManagers: FacetDependenciesManager[] = [];
  private readonly authorFacet: HeadlessFacet;
  private readonly sourceFacet: HeadlessFacet;
  private readonly objectTypeFacet: HeadlessFacet;
  private readonly fileTypeFacet: HeadlessFacet;

  constructor(props: {}) {
    super(props);

    this.engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });

    this.authorFacet = buildFacet(this.engine, {options: {field: 'author'}});
    this.sourceFacet = buildFacet(this.engine, {options: {field: 'source'}});
    this.objectTypeFacet = buildFacet(this.engine, {
      options: {field: 'objecttype'},
    });
    this.fileTypeFacet = buildFacet(this.engine, {
      options: {field: 'filetype'},
    });
  }

  establishDependency(
    dependentFacet: HeadlessFacet,
    parentFacet: HeadlessFacet
  ) {
    this.dependenciesManagers.push(
      buildFacetDependenciesManager(this.engine, {
        dependentFacetId: dependentFacet.state.facetId,
        dependencies: [
          {
            parentFacetId: parentFacet.state.facetId,
            isDependencyMet: (parentFacetValues) =>
              parentFacetValues.some((value) => value.state === 'selected'),
          },
        ],
      })
    );
  }

  componentDidMount() {
    this.establishDependency(this.objectTypeFacet, this.sourceFacet);
    this.establishDependency(this.authorFacet, this.objectTypeFacet);
    this.establishDependency(this.fileTypeFacet, this.authorFacet);
    this.engine.executeFirstSearch();
  }

  componentWillUnmount() {
    this.dependenciesManagers.forEach((dependenciesManager) =>
      dependenciesManager.stopWatching()
    );
  }

  render() {
    return (
      <>
        {<Facet controller={this.sourceFacet}></Facet>}
        {<Facet controller={this.objectTypeFacet}></Facet>}
        {<Facet controller={this.authorFacet}></Facet>}
        {<Facet controller={this.fileTypeFacet}></Facet>}
      </>
    );
  }
}
