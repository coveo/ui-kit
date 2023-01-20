import {
  AnyFacetValuesCondition,
  buildFacet,
  buildFacetConditionsManager,
  buildSearchEngine,
  FacetOptions,
  FacetValueRequest,
  getSampleSearchEngineConfiguration,
  SearchEngine,
} from '@coveo/headless';
import {FunctionComponent, useEffect, useMemo, useState} from 'react';

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

type FacetWithDependenciesControllerOptions = FacetOptions &
  Required<Pick<FacetOptions, 'facetId'>>;

interface FacetWithDependenciesProps {
  engine: SearchEngine;
  controllerOptions: FacetWithDependenciesControllerOptions;
  conditions?: AnyFacetValuesCondition<FacetValueRequest>[];
}

const FacetWithDependencies: FunctionComponent<FacetWithDependenciesProps> = ({
  engine,
  controllerOptions,
  conditions,
}) => {
  // Initialize facet.
  const controller = useMemo(
    () => buildFacet(engine, {options: controllerOptions}),
    [engine, controllerOptions]
  );
  const [state, setState] = useState(controller.state);
  useEffect(
    () => controller.subscribe(() => setState(controller.state)),
    [controller]
  );

  // Initialize conditions.
  useEffect(() => {
    if (!conditions?.length) {
      return;
    }
    const conditionsManager = buildFacetConditionsManager(engine, {
      facetId: controllerOptions.facetId,
      conditions: conditions,
    });
    return () => conditionsManager.stopWatching();
  }, [engine, controllerOptions, conditions]);

  // Hide if conditions aren't met.
  if (!state.enabled) {
    return null;
  }

  // Render facet.
  return (
    <ul>
      {state.values.map((value) => (
        <li key={value.value}>
          <input
            type="checkbox"
            checked={controller.isValueSelected(value)}
            onChange={() => controller.toggleSelect(value)}
            disabled={state.isLoading}
          />
          {value.value} ({value.numberOfResults} results)
        </li>
      ))}
    </ul>
  );
};

const DependentFacetExample: FunctionComponent<{
  currentExample: ExampleType;
}> = ({currentExample}) => {
  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: getSampleSearchEngineConfiguration(),
      }),
    [currentExample]
  );
  useEffect(() => {
    engine.executeFirstSearch();
  }, [engine]);

  const authorFacetOptions: FacetWithDependenciesControllerOptions = {
    facetId: 'author-1',
    field: 'author',
  };
  const sourceFacetOptions: FacetWithDependenciesControllerOptions = {
    facetId: 'source-1',
    field: 'source',
  };
  const objectTypeFacetOptions: FacetWithDependenciesControllerOptions = {
    facetId: 'objecttype-1',
    field: 'objecttype',
  };
  const fileTypeFacetOptions: FacetWithDependenciesControllerOptions = {
    facetId: 'filetype-1',
    field: 'filetype',
    sortCriteria: 'alphanumeric',
  };

  switch (currentExample) {
    case 'SingleParentSingleDependent':
      return (
        <>
          <FacetWithDependencies
            engine={engine}
            controllerOptions={sourceFacetOptions}
          />
          <FacetWithDependencies
            engine={engine}
            controllerOptions={objectTypeFacetOptions}
            conditions={[
              {
                parentFacetId: sourceFacetOptions.facetId,
                condition: (values) =>
                  values.some((value) => value.state === 'selected'),
              },
            ]}
          />
        </>
      );
    case 'SingleParentMultipleDependent':
      return (
        <>
          <FacetWithDependencies
            engine={engine}
            controllerOptions={sourceFacetOptions}
          />
          <FacetWithDependencies
            engine={engine}
            controllerOptions={objectTypeFacetOptions}
            conditions={[
              {
                parentFacetId: sourceFacetOptions.facetId,
                condition: (values) =>
                  values.some((value) => value.state === 'selected'),
              },
            ]}
          />
          <FacetWithDependencies
            engine={engine}
            controllerOptions={fileTypeFacetOptions}
            conditions={[
              {
                parentFacetId: sourceFacetOptions.facetId,
                condition: (values) =>
                  values.some((value) => value.state === 'selected'),
              },
            ]}
          />
        </>
      );
    case 'SingleValueDependent':
      return (
        <>
          <FacetWithDependencies
            engine={engine}
            controllerOptions={fileTypeFacetOptions}
          />
          <FacetWithDependencies
            engine={engine}
            controllerOptions={authorFacetOptions}
            conditions={[
              {
                parentFacetId: fileTypeFacetOptions.facetId,
                condition: (values) =>
                  values.some(
                    (value) =>
                      value.value === 'doc' && value.state === 'selected'
                  ),
              },
            ]}
          />
        </>
      );
    case 'ComplexDependencies':
      return (
        <>
          <FacetWithDependencies
            engine={engine}
            controllerOptions={sourceFacetOptions}
          />
          <FacetWithDependencies
            engine={engine}
            controllerOptions={objectTypeFacetOptions}
            conditions={[
              {
                parentFacetId: sourceFacetOptions.facetId,
                condition: (values) =>
                  values.some((value) => value.state === 'selected'),
              },
            ]}
          />
          <FacetWithDependencies
            engine={engine}
            controllerOptions={authorFacetOptions}
            conditions={[
              {
                parentFacetId: sourceFacetOptions.facetId,
                condition: (values) =>
                  values.some((value) => value.state === 'selected'),
              },
            ]}
          />
          <FacetWithDependencies
            engine={engine}
            controllerOptions={fileTypeFacetOptions}
            conditions={[
              {
                parentFacetId: authorFacetOptions.facetId,
                condition: (values) =>
                  values.some((value) => value.state === 'selected'),
              },
            ]}
          />
        </>
      );
    default:
      return null;
  }
};

export const DependentFacetPage = () => {
  const [currentExample, setCurrentExample] = useState<ExampleType>(
    'SingleParentSingleDependent'
  );

  return (
    <>
      <select
        onChange={(e) => setCurrentExample(e.target.value as ExampleType)}
      >
        {Object.entries(Examples).map(([key, value]) => (
          <option value={key} key={key}>
            {value.name}
          </option>
        ))}
      </select>
      <div>
        <h2>{Examples[currentExample].name}</h2>
        <h3>{Examples[currentExample].description}</h3>
        <DependentFacetExample currentExample={currentExample} />
      </div>
    </>
  );
};
