import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {emptyNextCorrection} from '../../did-you-mean/did-you-mean-state.js';
import {executeSearch} from '../search/search-actions.js';
import {didYouMeanReducer} from './did-you-mean-slice.js';
import {
  type DidYouMeanState,
  getDidYouMeanInitialState,
} from './did-you-mean-state.js';

describe('did you mean slice', () => {
  let state: DidYouMeanState;
  beforeEach(() => {
    state = getDidYouMeanInitialState();
  });

  describe('on #executeSearch.pending', () => {
    it('should set #state.queryCorrection to empty correction', () => {
      state.queryCorrection = {
        correctedQuery: 'camara',
        wordCorrections: [
          {
            correctedWord: 'camera',
            length: 6,
            offset: 0,
            originalWord: 'camara',
          },
        ],
      };
      expect(
        didYouMeanReducer(state, {type: executeSearch.pending.type})
          .queryCorrection
      ).toEqual(emptyNextCorrection());
    });
    it('should set #state.wasCorrectedTo to an empty string', () => {
      state.wasCorrectedTo = 'camara';
      const newState = didYouMeanReducer(state, {
        type: executeSearch.pending.type,
      });
      expect(newState.wasCorrectedTo).toBe('');
    });
  });

  describe('on #executedSearch.fulfilled', () => {
    let searchAction: ReturnType<typeof executeSearch.fulfilled>;
    beforeEach(() => {
      searchAction = executeSearch.fulfilled(
        buildSearchResponse(
          {
            queryCorrection: {
              correctedQuery: null,
              corrections: [],
              originalQuery: null,
            },
          },
          'balk camara'
        ),
        ''
      );
    });
    it('should set #state.originalQuery to #originalQuery from payload', () => {});
    describe('when #correctedQuery is null in the response', () => {
      it('should set #state.wasCorrectedTo to an empty string', () => {
        const newState = didYouMeanReducer(state, searchAction);
        expect(newState.wasCorrectedTo).toBe('');
      });
      describe('when #corrections is empty or undefined in the response', () => {
        it('should set #state.queryCorrection.correctedQuery to an empty string', () => {
          const newState = didYouMeanReducer(state, searchAction);
          expect(newState.queryCorrection.correctedQuery).toBe('');
        });
        it('should set #state.queryCorrection.wordCorrections to an empty array', () => {
          const newState = didYouMeanReducer(state, searchAction);
          expect(newState.queryCorrection.wordCorrections).toEqual([]);
        });
      });
      describe('when #corrections is not null in the response', () => {
        beforeEach(() => {
          searchAction.payload.response.queryCorrection!.corrections = [
            {
              correctedQuery: 'black camera',
              wordCorrections: [
                {
                  correctedWord: 'black',
                  length: 4,
                  offset: 0,
                  originalWord: 'balk',
                },
                {
                  correctedWord: 'camera',
                  length: 6,
                  offset: 6,
                  originalWord: 'camara',
                },
              ],
            },
            {
              correctedQuery: 'balk camera',
              wordCorrections: [
                {
                  correctedWord: 'camera',
                  length: 6,
                  offset: 6,
                  originalWord: 'camera',
                },
              ],
            },
          ];
        });
        it('should set #state.queryCorrection.correctedQuery to #corrections[0].correctedQuery', () => {
          const newState = didYouMeanReducer(state, searchAction);
          expect(newState.queryCorrection.correctedQuery).toBe('black camera');
        });
        it('should set #state.queryCorrection.wordCorrections to #corrections[0].wordCorrections', () => {
          const newState = didYouMeanReducer(state, searchAction);
          expect(newState.queryCorrection.wordCorrections).toEqual([
            {
              correctedWord: 'black',
              length: 4,
              offset: 0,
              originalWord: 'balk',
            },
            {
              correctedWord: 'camera',
              length: 6,
              offset: 6,
              originalWord: 'camara',
            },
          ]);
        });
      });
      describe('when #correctedQuery is not null in the response', () => {
        beforeEach(() => {
          searchAction.payload.response.queryCorrection = {
            correctedQuery: 'black camera',
            corrections: [],
            originalQuery: 'balk camara',
          };
        });
        it('should set #state.wasCorrectedTo to #correctedQuery from the response', () => {
          const newState = didYouMeanReducer(state, searchAction);
          expect(newState.wasCorrectedTo).toBe('black camera');
        });
        it('should set #state.queryCorrection.correctedQuery to #correctedQuery from the response', () => {
          const newState = didYouMeanReducer(state, searchAction);
          expect(newState.queryCorrection.correctedQuery).toBe('black camera');
        });
        it('should set #state.queryCorrection.wordCorrections to an empty array', () => {
          const newState = didYouMeanReducer(state, searchAction);
          expect(newState.queryCorrection.wordCorrections).toEqual([]);
        });
      });
    });
  });
});
