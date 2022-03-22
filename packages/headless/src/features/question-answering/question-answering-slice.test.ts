import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {buildMockRaw, buildMockResult} from '../../test';
import {
  buildMockQuestionAnswer,
  buildMockQuestionsAnswers,
} from '../../test/mock-question-answer';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {executeSearch} from '../search/search-actions';
import {
  collapseSmartSnippet,
  collapseSmartSnippetRelatedQuestion,
  dislikeSmartSnippet,
  expandSmartSnippet,
  expandSmartSnippetRelatedQuestion,
  likeSmartSnippet,
} from './question-answering-actions';
import {questionAnsweringReducer} from './question-answering-slice';
import {
  getQuestionAnsweringInitialState,
  QuestionAnsweringState,
} from './question-answering-state';

function buildUniqueQuestionAnswer(increment: number) {
  return buildMockQuestionAnswer({
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: `permanent\u0100id${increment}`,
    },
    answerSnippet: `ans\u0100wer${increment}`,
    question: `quest\u0100ion${increment}`,
    score: increment * 42,
  });
}

function buildUniqueSearchResponse(increment: number): SearchResponseSuccess {
  const permanentid = `permanent\u0100id${increment}`;
  return buildMockSearchResponse({
    searchUid: `searchUid${increment}`,
    results: [
      buildMockResult({
        raw: buildMockRaw({permanentid}),
      }),
    ],
    questionAnswer: buildMockQuestionsAnswers({
      ...buildUniqueQuestionAnswer(increment),
      relatedQuestions: [buildUniqueQuestionAnswer(increment * 1000)],
    }),
  });
}

describe('question answering slice', () => {
  let state: QuestionAnsweringState;

  beforeEach(() => {
    state = getQuestionAnsweringInitialState();
  });

  it('should have initial state', () => {
    const initial = questionAnsweringReducer(undefined, {type: 'undefined'});
    expect(initial.liked).toBe(false);
    expect(initial.disliked).toBe(false);
    expect(initial.expanded).toBe(false);
  });

  it('should handle expand smart snippet', () => {
    const resulting = questionAnsweringReducer(state, expandSmartSnippet());
    expect(resulting.expanded).toBe(true);
  });

  it('should handle collapse smart snippet', () => {
    state.expanded = true;
    const resulting = questionAnsweringReducer(state, collapseSmartSnippet());
    expect(resulting.expanded).toBe(false);
  });

  it('should handle likeSmartSnippet', () => {
    state.disliked = true;
    const resulting = questionAnsweringReducer(state, likeSmartSnippet());
    expect(resulting.liked).toBe(true);
    expect(resulting.disliked).toBe(false);
  });

  it('should handle dislikeSmartSnippet', () => {
    state.liked = true;
    const resulting = questionAnsweringReducer(state, dislikeSmartSnippet());
    expect(resulting.disliked).toBe(true);
    expect(resulting.liked).toBe(false);
  });

  it('should handle expandSmartSnippetRelatedQuestion', () => {
    state.relatedQuestions = [
      {contentIdKey: 'foo', contentIdValue: 'bar', expanded: false},
      {contentIdKey: 'foo', contentIdValue: 'bazz', expanded: false},
    ];
    const resulting = questionAnsweringReducer(
      state,
      expandSmartSnippetRelatedQuestion({
        contentIdKey: 'foo',
        contentIdValue: 'bazz',
      })
    );
    expect(resulting.relatedQuestions[1].expanded).toBe(true);
  });

  it('should handle collapseSmartSnippetRelatedQuestion', () => {
    state.relatedQuestions = [
      {contentIdKey: 'foo', contentIdValue: 'bar', expanded: true},
      {contentIdKey: 'foo', contentIdValue: 'bazz', expanded: true},
    ];
    const resulting = questionAnsweringReducer(
      state,
      collapseSmartSnippetRelatedQuestion({
        contentIdKey: 'foo',
        contentIdValue: 'bazz',
      })
    );
    expect(resulting.relatedQuestions[1].expanded).toBe(false);
  });

  it('should handle executeSearch to populate relatedQuestions', () => {
    const response = buildUniqueSearchResponse(0);
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        response,
      }),
      '',
      null as never
    );
    const resulting = questionAnsweringReducer(state, searchAction);
    const {contentIdKey, contentIdValue} =
      response.questionAnswer.relatedQuestions[0].documentId;
    expect(resulting.relatedQuestions[0]).toMatchObject({
      contentIdKey,
      contentIdValue,
      expanded: false,
    });
  });

  it('when executeSearch is triggered again with the same question answer, does not reset', () => {
    const firstSearchResponse = buildUniqueSearchResponse(0);
    const firstResponseState = questionAnsweringReducer(
      state,
      executeSearch.fulfilled(
        buildMockSearch({response: firstSearchResponse}),
        '',
        null as never
      )
    );

    const intermediateState = questionAnsweringReducer(
      firstResponseState,
      likeSmartSnippet()
    );

    const secondSearchResponse = buildUniqueSearchResponse(1);
    secondSearchResponse.questionAnswer =
      buildUniqueSearchResponse(0).questionAnswer;
    const finalState = questionAnsweringReducer(
      intermediateState,
      executeSearch.fulfilled(
        buildMockSearch({response: secondSearchResponse}),
        '',
        null as never
      )
    );

    expect(finalState.liked).toBeTruthy();
  });

  it('when executeSearch is triggered again with a slightly different question answer, resets', () => {
    const firstSearchResponse = buildUniqueSearchResponse(0);
    const firstResponseState = questionAnsweringReducer(
      state,
      executeSearch.fulfilled(
        buildMockSearch({response: firstSearchResponse}),
        '',
        null as never
      )
    );

    const intermediateState = questionAnsweringReducer(
      firstResponseState,
      likeSmartSnippet()
    );

    const secondSearchResponse = buildUniqueSearchResponse(1);
    secondSearchResponse.questionAnswer =
      buildUniqueSearchResponse(0).questionAnswer;
    secondSearchResponse.questionAnswer.question += 'a';
    const finalState = questionAnsweringReducer(
      intermediateState,
      executeSearch.fulfilled(
        buildMockSearch({response: secondSearchResponse}),
        '',
        null as never
      )
    );

    expect(finalState.liked).toBeFalsy();
  });
});
