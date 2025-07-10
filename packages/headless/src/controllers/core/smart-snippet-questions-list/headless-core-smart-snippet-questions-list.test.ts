import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
} from '../../../features/question-answering/question-answering-actions.js';
import {smartSnippetAnalyticsClient} from '../../../features/question-answering/question-answering-analytics-actions.js';
import {questionAnsweringReducer as questionAnswering} from '../../../features/question-answering/question-answering-slice.js';
import {getQuestionAnsweringInitialState} from '../../../features/question-answering/question-answering-state.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import {emptyQuestionAnswer} from '../../../features/search/search-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockRaw} from '../../../test/mock-raw.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {buildMockSearchState} from '../../../test/mock-search-state.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreSmartSnippetQuestionsList,
  type CoreSmartSnippetQuestionsList,
} from './headless-core-smart-snippet-questions-list.js';

vi.mock('../../../features/question-answering/question-answering-actions');
vi.mock(
  '../../../features/question-answering/question-answering-analytics-actions'
);

const examplePermanentIdOne = 'example permanentid one';
const examplePermanentIdTwo = 'example permanentid two';

const exampleResultOne = buildMockResult({
  title: 'example result one',
  raw: buildMockRaw({
    permanentid: examplePermanentIdOne,
  }),
});
const exampleResultTwo = buildMockResult({
  title: 'example result two',
  raw: buildMockRaw({
    permanentid: examplePermanentIdTwo,
  }),
});

const exampleRelatedQuestionOne = {
  question: 'question one',
  answerSnippet: 'answer one',
  documentId: {
    contentIdKey: 'permanentid',
    contentIdValue: examplePermanentIdOne,
  },
  score: 1,
};
const exampleRelatedQuestionStateOne = {
  expanded: false,
  questionAnswerId: '1',
  contentIdKey: 'permanentid',
  contentIdValue: examplePermanentIdOne,
};

const exampleRelatedQuestionTwo = {
  question: 'question two',
  answerSnippet: 'answer two',
  documentId: {
    contentIdKey: 'permanentid',
    contentIdValue: examplePermanentIdTwo,
  },
  score: 2,
};
const exampleRelatedQuestionStateTwo = {
  expanded: false,
  questionAnswerId: '2',
  contentIdKey: 'permanentid',
  contentIdValue: examplePermanentIdTwo,
};

describe('SmartSnippetQuestionsList', () => {
  let engine: MockedSearchEngine;
  let smartSnippetQuestionsList: CoreSmartSnippetQuestionsList;

  function initSmartSnippetQuestionsList() {
    smartSnippetQuestionsList = buildCoreSmartSnippetQuestionsList(
      engine,
      smartSnippetAnalyticsClient
    );
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    initSmartSnippetQuestionsList();
  });

  it('initializes', () => {
    expect(smartSnippetQuestionsList).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      search,
      questionAnswering,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(smartSnippetQuestionsList.subscribe).toBeTruthy();
  });

  it('#expand dispatches #expandSmartSnippetRelatedQuestion with the correct payload', () => {
    const exampleId = 'example id';
    smartSnippetQuestionsList.expand(exampleId);
    expect(expandSmartSnippetRelatedQuestion).toHaveBeenCalledWith({
      questionAnswerId: exampleId,
    });
  });

  it('#collapse dispatches #collapseSmartSnippetRelatedQuestion with the correct payload', () => {
    const exampleId = 'example id';
    smartSnippetQuestionsList.collapse(exampleId);
    expect(collapseSmartSnippetRelatedQuestion).toHaveBeenCalledWith({
      questionAnswerId: exampleId,
    });
  });

  it('should properly build the state', () => {
    engine.state.questionAnswering = {
      ...getQuestionAnsweringInitialState(),
      relatedQuestions: [
        exampleRelatedQuestionStateOne,
        exampleRelatedQuestionStateTwo,
      ],
    };
    engine.state.search = buildMockSearchState({
      results: [exampleResultOne, exampleResultTwo],
      questionAnswer: {
        ...emptyQuestionAnswer(),
        relatedQuestions: [
          exampleRelatedQuestionOne,
          exampleRelatedQuestionTwo,
        ],
      },
    });

    const expectedState = [
      {
        question: exampleRelatedQuestionOne.question,
        answer: exampleRelatedQuestionOne.answerSnippet,
        documentId: exampleRelatedQuestionOne.documentId,
        questionAnswerId: exampleRelatedQuestionStateOne.questionAnswerId,
        expanded: exampleRelatedQuestionStateOne.expanded,
        source: exampleResultOne,
      },
      {
        question: exampleRelatedQuestionTwo.question,
        answer: exampleRelatedQuestionTwo.answerSnippet,
        documentId: exampleRelatedQuestionTwo.documentId,
        questionAnswerId: exampleRelatedQuestionStateTwo.questionAnswerId,
        expanded: exampleRelatedQuestionStateTwo.expanded,
        source: exampleResultTwo,
      },
    ];
    expect(smartSnippetQuestionsList.state.questions).toStrictEqual(
      expectedState
    );
  });

  it('should not dispatch any action at initialization', () => {
    expect(engine.dispatch).not.toHaveBeenCalled();
  });
});
