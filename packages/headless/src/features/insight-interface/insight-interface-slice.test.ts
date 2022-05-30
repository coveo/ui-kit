import {fetchInterface} from './insight-interface-actions';
import {insightInterfaceReducer} from './insight-interface-slice';
import {
  getInsightInterfaceInitialState,
  InsightInterfaceState,
} from './insight-interface-state';

describe('insight interface slice', () => {
  const requestId = 'some-request-id';
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
      fetchInterface.pending(requestId)
    );

    expect(modifiedState.loading).toBe(true);
  });

  describe('when fetching interface fails', () => {
    const errorResponse = {
      message: 'something bad happened',
      statusCode: 400,
      type: 'badluck',
    };

    const failedAction = fetchInterface.rejected(
      null,
      requestId,
      null as unknown as void,
      errorResponse
    );

    it('should set #loading to #false', () => {
      const modifiedState = insightInterfaceReducer(state, failedAction);

      expect(modifiedState.loading).toBe(false);
    });

    it('should set #error', () => {
      const modifiedState = insightInterfaceReducer(state, failedAction);

      expect(modifiedState.error).toStrictEqual(errorResponse);
    });

    it('should set #config to #undefined', () => {
      const modifiedState = insightInterfaceReducer(state, failedAction);

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
        fetchInterface.fulfilled(fetchInterfaceResponse, requestId)
      );

      expect(modifiedState.loading).toBe(false);
    });

    it('should update the #config when no interface is returned', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.fulfilled(fetchInterfaceResponse, requestId)
      );

      const {searchHub, ...expectedConfig} = fetchInterfaceResponse.response;

      expect(modifiedState.config).toStrictEqual(expectedConfig);
    });

    it('should update the #config when an interface is returned', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.fulfilled(fetchInterfaceResponseWithInterface, requestId)
      );

      const {searchHub, ...expectedConfig} =
        fetchInterfaceResponseWithInterface.response;

      expect(modifiedState.config).toStrictEqual(expectedConfig);
    });

    it('should set #error to #undefined', () => {
      const modifiedState = insightInterfaceReducer(
        state,
        fetchInterface.fulfilled(fetchInterfaceResponse, requestId)
      );

      expect(modifiedState.error).toBeUndefined();
    });
  });
});
