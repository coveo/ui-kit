import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {InferCSRState, defineResultList} from '@coveo/headless/ssr';
import '@testing-library/jest-dom';
import {render} from '@testing-library/react';
import {useEffect, useState} from 'react';
import {defineSearchEngine} from './search-engine';

describe('Headless react SSR utils', () => {
  let errorSpy: jest.SpyInstance;
  const sampleConfig = {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false}, // TODO: KIT-2585 Remove after analytics SSR support is added
  };

  beforeEach(() => {
    errorSpy = jest.spyOn(global.console, 'error');
  });

  test('defines react search engine', () => {
    const {
      fetchInitialState,
      hydrateInitialState,
      build,
      useEngine,
      controllers,
      SSRStateProvider,
      CSRProvider,
      ...rest
    } = defineSearchEngine({
      configuration: sampleConfig,
    });

    [
      fetchInitialState,
      hydrateInitialState,
      build,
      useEngine,
      SSRStateProvider,
      CSRProvider,
    ].forEach((returnValue) => expect(typeof returnValue).toBe('function'));

    expect(controllers).toEqual({});
    expect(rest).toEqual({}); // No other return values
  });

  test('creates a hook based on given controller', () => {
    const {controllers} = defineSearchEngine({
      configuration: sampleConfig,
      controllers: {resultList: defineResultList()},
    });
    expect(typeof controllers.useResultList).toEqual('function');
  });

  describe('renders providers without error', () => {
    const engineDefinition = defineSearchEngine({
      configuration: sampleConfig,
      controllers: {resultList: defineResultList()},
    });
    const {
      fetchInitialState,
      hydrateInitialState,
      SSRStateProvider,
      CSRProvider,
      controllers,
    } = engineDefinition;

    type CSRSearchState = InferCSRState<typeof engineDefinition>;

    test('SSRProvider', async () => {
      const ssrState = await fetchInitialState();
      render(<SSRStateProvider controllers={ssrState.controllers} />);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    test('CSR Provider', async () => {
      const ssrState = await fetchInitialState();
      function TestResultList() {
        const {state} = controllers.useResultList();
        return (
          <ul>
            {state.results.map((result) => (
              <li key={result.uniqueId}>{result.title}</li>
            ))}
          </ul>
        );
      }

      function TestResultsPage() {
        const [csrResult, setCSRResult] = useState<CSRSearchState | undefined>(
          undefined
        );
        useEffect(() => {
          hydrateInitialState(ssrState).then(({engine, controllers}) => {
            setCSRResult({engine, controllers});
          });
        });

        if (csrResult) {
          return (
            <CSRProvider
              engine={csrResult.engine}
              controllers={csrResult.controllers}
            >
              <TestResultList />
            </CSRProvider>
          );
        } else {
          return (
            <SSRStateProvider controllers={ssrState.controllers}>
              <TestResultList />
            </SSRStateProvider>
          );
        }
      }

      render(<TestResultsPage />);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
