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

  afterEach(() => {
    errorSpy.mockClear();
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
    const resultItemClassName = 'result-item';
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

    function TestResultList() {
      const {state} = controllers.useResultList();
      return (
        <ul role="result-list">
          {state.results.map((result) => (
            <li className={resultItemClassName} key={result.uniqueId}>
              {result.title}
            </li>
          ))}
        </ul>
      );
    }

    test('should throw error when controller hook is used without context', () => {
      let err = undefined;
      try {
        render(<TestResultList></TestResultList>);
      } catch (e) {
        err = e as Error;
      }
      expect(err?.message).toMatch('Missing SSR state or CSR provider.');
      expect(errorSpy).toHaveBeenCalled();
    });

    test('SSRProvider', async () => {
      const ssrState = await fetchInitialState();
      render(<SSRStateProvider controllers={ssrState.controllers} />);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    test('CSR Provider', async () => {
      const ssrState = await fetchInitialState();

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
      // screen.debug();
      // TODO (before merge): fix error "When testing, code that causes React state updates should be wrapped into act"
      // await screen.findByRole(resultItemClassName);
      expect(errorSpy).not.toHaveBeenCalled();
      // expect((await screen.findAllByRole('li')).length).toBe(10);
    });
  });
});
