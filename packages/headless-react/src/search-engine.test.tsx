import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {InferCSRState, defineResultList} from '@coveo/headless/ssr';
import '@testing-library/jest-dom';
import {render} from '@testing-library/react';
import {useEffect, useState} from 'react';
import {MissingEngineProviderError, defineSearchEngine} from './search-engine';

// Suppress known errors
const originalError = console.error;
const expectedErrors = [
  // https://github.com/testing-library/react-testing-library#suppressing-unnecessary-warnings-on-react-dom-168
  /Warning.*not wrapped in act/,
  // TODO: Filter out following errors by wrapping in Error boundary
  // /Error: Uncaught [Error: Unable to find Context. Please make sure you are wrapping your component with either `SSRStateProvider` or `CSRProvider` component that can provide the required context.]/,
  // /The above error occurred in the.*Consider adding an error boundary to your tree to customize error handling behavior/,
];
beforeAll(() => {
  console.error = (...args) => {
    if (
      expectedErrors.some((expectedError) =>
        new RegExp(expectedError).test(args[0])
      )
    ) {
      return;
    }

    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('Headless react SSR utils', () => {
  let errorSpy: jest.SpyInstance;
  const sampleConfig = {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false}, // TODO: KIT-2585 Remove after analytics SSR support is added
  };

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error');
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
        // TODO: Add error boundary https://reactjs.org/link/error-boundaries to prevent stack trace in console.
        render(<TestResultList></TestResultList>);
      } catch (e) {
        err = e as Error;
      }

      expect(errorSpy).toHaveBeenCalled();
      expect(err?.message).toBe(MissingEngineProviderError.message);
    });

    test('SSRProvider', async () => {
      const ssrState = await fetchInitialState();
      render(<SSRStateProvider controllers={ssrState.controllers} />);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    test('CSRProvider', async () => {
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
      // await screen.findByRole(resultItemClassName);
      expect(errorSpy).not.toHaveBeenCalled();
      // expect((await screen.findAllByRole('li')).length).toBe(10);
    });
  });
});
