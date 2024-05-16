import {SearchAppState} from '../../state/search-app-state';
import {mockRelay} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {buildMockTabSlice} from '../../test/mock-tab-state';
import {buildSearchAndFoldingLoadCollectionRequest} from './search-and-folding-request';

describe('buildSearchAndFoldingLoadCollectionRequest', () => {
  describe('#aq', () => {
    it(`when there is an aq in state,
    the expression is included in the request`, async () => {
      const state = createMockState();
      state.advancedSearchQueries.aq = 'a';

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.aq).toBe('a');
    });

    it(`when the aq is an empty string,
    the aq is not included in the request`, async () => {
      const state = createMockState();
      state.advancedSearchQueries.aq = '';

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.aq).toBe(undefined);
    });
  });

  describe('#cq', () => {
    it(`when there is a cq in state,
    the expression is included in the request`, async () => {
      const state = createMockState();
      state.advancedSearchQueries.cq = 'a';

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.cq).toBe('a');
    });

    it(`when there is an active tab,
    the tab expression is not included in the cq`, async () => {
      const state = createMockState();
      state.tabSet = {a: buildMockTabSlice({expression: 'a', isActive: true})};

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.cq).toBe(undefined);
    });
  });

  describe('#lq', () => {
    it(`when there is an lq in state,
    the expression is included in the request`, async () => {
      const state = createMockState();
      state.advancedSearchQueries.lq = 'a';

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.lq).toBe('a');
    });

    it(`when the lq is an empty string,
    the lq is not included in the request`, async () => {
      const state = createMockState();
      state.advancedSearchQueries.lq = '';

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.lq).toBe(undefined);
    });
  });

  describe('#dq', () => {
    it(`when there is a dq in state,
    the expression is included in the request`, async () => {
      const state = createMockState();
      state.advancedSearchQueries.dq = 'a';

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.dq).toBe('a');
    });

    it(`when the dq is an empty string,
    the dq is not included in the request`, async () => {
      const state = createMockState();
      state.advancedSearchQueries.dq = '';

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.dq).toBe(undefined);
    });
  });

  describe('#excerptLength', () => {
    it(`when there is an excerpt length in state,
    the parameter is included in the request`, async () => {
      const state = createMockState();
      state.excerptLength = {length: 1234};

      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.excerptLength).toBe(1234);
    });

    it('when there is no excerptLength in the state, the parameter is not included in the request', async () => {
      const state = createMockState();
      state.excerptLength.length = undefined;
      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.excerptLength).toBe(undefined);
    });
  });

  describe('when analytics are enabled', () => {
    let state: SearchAppState;
    beforeEach(() => {
      state = createMockState();
      state.configuration.analytics.enabled = true;
    });

    it('#visitorId is included in the request', async () => {
      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.visitorId).toBeDefined();
    });
  });

  describe('when analytics are disabled', () => {
    let state: SearchAppState;
    beforeEach(() => {
      state = createMockState();
      state.configuration.analytics.enabled = false;
    });

    it('#visitorId is not included in the request', async () => {
      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.visitorId).toBeUndefined();
    });

    it('#actionsHistory is not included in the request', async () => {
      const request = buildSearchAndFoldingLoadCollectionRequest(
        state,
        {location: '', referrer: '', userAgent: ''},
        mockRelay()
      );
      expect(request.actionsHistory).toBeUndefined();
    });
  });
});
