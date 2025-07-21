import {
  buildFacet,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  type Facet as HeadlessFacet,
  type SearchEngine,
} from '@coveo/headless';
import {Component} from 'react';
import {MultilevelDependentFacet} from '../components/dependent-facet/multi-level-dependent-facet';
import {SingleParentMultipleDependentFacet} from '../components/dependent-facet/single-parent-multiple-dependent.fn';
import {SingleParentSingleDependentFacet} from '../components/dependent-facet/single-parent-single-dependent.fn';
import {SingleValueDependentFacet} from '../components/dependent-facet/single-value-dependent.fn';

const Examples = {
  SingleParentSingleDependent: {
    name: 'Single parent and dependent facet',
    description:
      'The most simple dependency: A single parent with a single dependent facet.',
  },
  SingleParentMultipleDependent: {
    name: 'Single parent with multiple dependent facet',
    description:
      'An example of a single parent facet, that controls the appearance of multiple dependent facet',
  },
  SingleValueDependent: {
    name: 'Single parent with a single value dependency',
    description:
      'A dependency where the dependent facet only appears if a precise value is selected (filetype == doc)',
  },
  ComplexDependencies: {
    name: 'Complex dependency (multiple level)',
    description:
      'A dependency with multiple level of hierarchy, where a grandparent facet controls the appearance of multiple parent facet, each with their own dependent facet',
  },
} as const;

type ExampleType = keyof typeof Examples;

export class DependentFacetPage extends Component<
  {},
  {currentExample: ExampleType}
> {
  private engine: SearchEngine;
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
    this.state = {currentExample: 'SingleParentSingleDependent'};
  }

  componentDidMount() {
    this.engine.executeFirstSearch();
  }

  render() {
    return (
      <>
        <select
          onChange={(e) =>
            this.setState({currentExample: e.target.value as ExampleType})
          }
        >
          {Object.entries(Examples).map(([key, value]) => (
            <option value={key} key={key}>
              {value.name}
            </option>
          ))}
        </select>
        <div>
          <h2>{Examples[this.state.currentExample].name}</h2>
          <h3>{Examples[this.state.currentExample].description}</h3>
          {this.renderExample()}
        </div>
      </>
    );
  }

  renderExample() {
    switch (this.state.currentExample) {
      case 'SingleParentSingleDependent':
        return (
          <SingleParentSingleDependentFacet
            engine={this.engine}
            parentFacet={this.sourceFacet}
            dependentFacet={this.objectTypeFacet}
          />
        );
      case 'SingleParentMultipleDependent':
        return (
          <SingleParentMultipleDependentFacet
            engine={this.engine}
            parentFacet={this.sourceFacet}
            dependentFacets={[this.objectTypeFacet, this.fileTypeFacet]}
          />
        );

      case 'SingleValueDependent':
        return (
          <SingleValueDependentFacet
            engine={this.engine}
            parentFacet={this.fileTypeFacet}
            dependentFacet={this.authorFacet}
            dependentValue="doc"
          />
        );

      case 'ComplexDependencies':
        return (
          <MultilevelDependentFacet
            engine={this.engine}
            dependencies={{
              [this.sourceFacet.state.facetId]: {
                facet: this.sourceFacet,
              },
              [this.objectTypeFacet.state.facetId]: {
                facet: this.objectTypeFacet,
                dependsOn: this.sourceFacet,
              },
              [this.authorFacet.state.facetId]: {
                facet: this.authorFacet,
                dependsOn: this.sourceFacet,
              },
              [this.fileTypeFacet.state.facetId]: {
                facet: this.fileTypeFacet,
                dependsOn: this.authorFacet,
              },
            }}
          />
        );

      default:
        return null;
    }
  }
}
