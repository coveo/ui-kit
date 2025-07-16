import type {SearchResponseSuccess} from '../../api/search/search/search-response.js';
import {
  buildMockQuestionAnswer,
  buildMockQuestionsAnswers,
} from '../../test/mock-question-answer.js';
import {buildMockRaw} from '../../test/mock-raw.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearch} from '../../test/mock-search.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {executeSearch} from '../search/search-actions.js';
import {
  collapseSmartSnippet,
  collapseSmartSnippetRelatedQuestion,
  dislikeSmartSnippet,
  expandSmartSnippet,
  expandSmartSnippetRelatedQuestion,
  likeSmartSnippet,
} from './question-answering-actions.js';
import {questionAnsweringReducer} from './question-answering-slice.js';
import {
  getQuestionAnsweringInitialState,
  type QuestionAnsweringState,
} from './question-answering-state.js';

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

function buildUniqueSearchResponse(
  increment: number,
  amountOfRelatedQuestions = 0
): SearchResponseSuccess {
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
      relatedQuestions: Array.from({length: amountOfRelatedQuestions}, (_, i) =>
        buildUniqueQuestionAnswer(
          increment +
            (i + 1) /
              10 ** (Math.floor(Math.log10(amountOfRelatedQuestions)) + 1)
        )
      ),
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

  it('should handle expandSmartSnippetRelatedQuestion using the unique id', () => {
    state.relatedQuestions = [
      {
        contentIdKey: 'foo',
        contentIdValue: 'bar',
        expanded: false,
        questionAnswerId: 'abc',
      },
      {
        contentIdKey: 'foo',
        contentIdValue: 'bazz',
        expanded: false,
        questionAnswerId: 'def',
      },
      {
        contentIdKey: 'foo',
        contentIdValue: 'bazz',
        expanded: false,
        questionAnswerId: 'ghi',
      },
    ];
    const resulting = questionAnsweringReducer(
      state,
      expandSmartSnippetRelatedQuestion({
        questionAnswerId: 'def',
      })
    );
    expect(resulting.relatedQuestions[0].expanded).toBe(false);
    expect(resulting.relatedQuestions[1].expanded).toBe(true);
    expect(resulting.relatedQuestions[2].expanded).toBe(false);
  });

  it('should handle collapseSmartSnippetRelatedQuestion using the unique id', () => {
    state.relatedQuestions = [
      {
        contentIdKey: 'foo',
        contentIdValue: 'bar',
        expanded: true,
        questionAnswerId: 'abc',
      },
      {
        contentIdKey: 'foo',
        contentIdValue: 'bazz',
        expanded: true,
        questionAnswerId: 'def',
      },
      {
        contentIdKey: 'foo',
        contentIdValue: 'bazz',
        expanded: true,
        questionAnswerId: 'ghi',
      },
    ];
    const resulting = questionAnsweringReducer(
      state,
      collapseSmartSnippetRelatedQuestion({
        questionAnswerId: 'def',
      })
    );
    expect(resulting.relatedQuestions[0].expanded).toBe(true);
    expect(resulting.relatedQuestions[1].expanded).toBe(false);
    expect(resulting.relatedQuestions[2].expanded).toBe(true);
  });

  it('should handle executeSearch to populate relatedQuestions', () => {
    const response = buildUniqueSearchResponse(0, 1);
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
        {legacy: null as never}
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
        {legacy: null as never}
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
        {legacy: null as never}
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
        {legacy: null as never}
      )
    );

    expect(finalState.liked).toBeFalsy();
  });

  it('when executeSearch is triggered again, resets only the altered snippets', () => {
    const relatedQuestionsCount = 5;
    const firstSearchResponse = buildUniqueSearchResponse(
      0,
      relatedQuestionsCount
    );
    const firstResponseState = questionAnsweringReducer(
      state,
      executeSearch.fulfilled(
        buildMockSearch({response: firstSearchResponse}),
        '',
        {legacy: null as never}
      )
    );

    const stateWithAllSnippetsExpanded =
      firstResponseState.relatedQuestions.reduce(
        (state, {questionAnswerId}) =>
          questionAnsweringReducer(
            state,
            expandSmartSnippetRelatedQuestion({
              questionAnswerId: questionAnswerId,
            })
          ),
        firstResponseState
      );

    const secondSearchResponse = buildUniqueSearchResponse(
      0,
      relatedQuestionsCount
    );
    const {relatedQuestions: expandedQuestions} =
      secondSearchResponse.questionAnswer;
    expandedQuestions[0].question += 'a';
    expandedQuestions[1].answerSnippet += 'a';
    expandedQuestions[2].documentId.contentIdKey += 'a';
    expandedQuestions[3].documentId.contentIdValue += 'a';
    const finalState = questionAnsweringReducer(
      stateWithAllSnippetsExpanded,
      executeSearch.fulfilled(
        buildMockSearch({response: secondSearchResponse}),
        '',
        {legacy: null as never}
      )
    );

    const {relatedQuestions: finalQuestions} = finalState;
    expect(finalQuestions[0].expanded).toBeFalsy();
    expect(finalQuestions[1].expanded).toBeFalsy();
    expect(finalQuestions[2].expanded).toBeFalsy();
    expect(finalQuestions[3].expanded).toBeFalsy();
    expect(finalQuestions[4].expanded).toBeTruthy();
  });
});
