import {fetchInterface} from './insight-interface-actions.js';
import {insightInterfaceReducer} from './insight-interface-slice.js';
import {getInsightInterfaceInitialState} from './insight-interface-state.js';

describe('insight interface slice', () => {
  const requestId = 'some-request-id';
  const errorResponse = {
    message: 'something bad happened',
    statusCode: 400,
    type: 'badluck',
  };

  it('should have an initial state', () => {
    expect(insightInterfaceReducer(undefined, {type: 'foo'})).toEqual(
      getInsightInterfaceInitialState()
    );
  });

  it('should set #loading to #true when fetching the interface', () => {
    const modifiedState = insightInterfaceReducer(
      getInsightInterfaceInitialState(),
      fetchInterface.pending(requestId)
    );

    expect(modifiedState.loading).toBe(true);
  });

  it('should clear the #error when fetching the interface', () => {
    const errorState = {
      ...getInsightInterfaceInitialState(),
      error: errorResponse,
    };

    const modifiedState = insightInterfaceReducer(
      errorState,
      fetchInterface.pending(requestId)
    );

    expect(modifiedState.error).toBeUndefined();
  });

  describe('when fetching interface fails', () => {
    const failedAction = fetchInterface.rejected(
      null,
      requestId,
      null as unknown as undefined,
      errorResponse
    );

    it('should set #loading to #false', () => {
      const modifiedState = insightInterfaceReducer(
        getInsightInterfaceInitialState(),
        failedAction
      );

      expect(modifiedState.loading).toBe(false);
    });

    it('should set #error', () => {
      const modifiedState = insightInterfaceReducer(
        getInsightInterfaceInitialState(),
        failedAction
      );

      expect(modifiedState.error).toStrictEqual(errorResponse);
    });

    it('should set #config to #undefined', () => {
      const modifiedState = insightInterfaceReducer(
        getInsightInterfaceInitialState(),
        failedAction
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
            genQA: {
              enabled: false,
              collapsible: true,
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
          answerConfigId: '123',
        },
      },
    };

    it('should set #loading to #false', () => {
      const modifiedState = insightInterfaceReducer(
        getInsightInterfaceInitialState(),
        fetchInterface.fulfilled(fetchInterfaceResponse, requestId)
      );

      expect(modifiedState.loading).toBe(false);
    });

    it('should update the #config when no interface is returned', () => {
      const modifiedState = insightInterfaceReducer(
        getInsightInterfaceInitialState(),
        fetchInterface.fulfilled(fetchInterfaceResponse, requestId)
      );

      const {searchHub: _searchHub, ...expectedConfig} =
        fetchInterfaceResponse.response;

      expect(modifiedState.config).toStrictEqual(expectedConfig);
    });

    it('should update the #config when an interface is returned', () => {
      const modifiedState = insightInterfaceReducer(
        getInsightInterfaceInitialState(),
        fetchInterface.fulfilled(fetchInterfaceResponseWithInterface, requestId)
      );

      const {searchHub: _searchHub, ...expectedConfig} =
        fetchInterfaceResponseWithInterface.response;

      expect(modifiedState.config).toStrictEqual(expectedConfig);
    });

    it('should set #error to #undefined', () => {
      const modifiedState = insightInterfaceReducer(
        getInsightInterfaceInitialState(),
        fetchInterface.fulfilled(fetchInterfaceResponse, requestId)
      );

      expect(modifiedState.error).toBeUndefined();
    });
  });
});
