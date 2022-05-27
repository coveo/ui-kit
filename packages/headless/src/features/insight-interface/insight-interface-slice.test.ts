import {fetchInterface} from './insight-interface-actions';
import {insightInterfaceReducer} from './insight-interface-slice';
import {
  getInsightInterfaceInitialState,
  InsightInterfaceState,
} from './insight-interface-state';

describe('insight interface slice', () => {
  let state: InsightInterfaceState;

  beforeEach(() => {
    state = getInsightInterfaceInitialState();
  });

  it('should have an initial state', () => {
    expect(insightInterfaceReducer(undefined, {type: 'foo'})).toEqual(
      getInsightInterfaceInitialState()
    );
  });

  it('should set #loading to #true when fetching the interface', () => {
    const modifiedState = insightInterfaceReducer(
      state,
      fetchInterface.pending('req-id')
    );

    expect(modifiedState.loading).toBe(true);
  });

  describe('when fetching interface fails', () => {
    it('should set #loading to #false', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.rejected(new Error('It failed!'), 'req-id')
      );

      expect(modifiedState.loading).toBe(false);
    });

    it('should set #error', () => {
      const expectedError = {
        message: 'something bad happened',
        statusCode: 400,
        type: 'badluck',
      };

      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.rejected(
          null,
          'req-id',
          null as unknown as void,
          expectedError
        )
      );

      expect(modifiedState.error).toStrictEqual(expectedError);
    });

    it('should set #config to #undefined', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.rejected(new Error('It failed!'), 'req-id')
      );

      expect(modifiedState.config).toBeUndefined();
    });
  });

  describe('when fetching interface succeeds', () => {
    const fetchInterfaceResponse = {
      response: {
        contextFields: {someField: 'some value'},
        searchHub: 'my-search-hub',
        interface: undefined,
      },
    };

    const fetchInterfaceResponseWithInterface = {
      response: {
        ...fetchInterfaceResponse.response,
        interface: {
          id: 'my-interface-id',
          name: 'My insight interface',
          resultTemplates: [],
          facets: [],
          tabs: [],
          settings: {
            createArticle: {
              enabled: false,
            },
            fullSearch: {
              enabled: false,
            },
            userActions: {
              enabled: false,
              recentClickedDocuments: {
                enabled: false,
              },
              recentQueries: {
                enabled: false,
              },
              timeline: {
                enabled: false,
              },
            },
          },
        },
      },
    };

    it('should set #loading to #false', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.fulfilled(fetchInterfaceResponse, 'req-id')
      );

      expect(modifiedState.loading).toBe(false);
    });

    it('should update the #config when no interface is returned', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.fulfilled(fetchInterfaceResponse, 'req-id')
      );

      const {searchHub, ...expectedConfig} = fetchInterfaceResponse.response;

      expect(modifiedState.config).toStrictEqual(expectedConfig);
    });

    it('should update the #config when an interface is returned', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.fulfilled(fetchInterfaceResponseWithInterface, 'req-id')
      );

      const {searchHub, ...expectedConfig} =
        fetchInterfaceResponseWithInterface.response;

      expect(modifiedState.config).toStrictEqual(expectedConfig);
    });

    it('should set #error to #undefined', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.fulfilled(fetchInterfaceResponse, 'req-id')
      );

      expect(modifiedState.error).toBeUndefined();
    });
  });
});
