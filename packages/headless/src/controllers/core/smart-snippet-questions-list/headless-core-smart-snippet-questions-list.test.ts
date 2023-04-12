import {search, questionAnswering} from '../../../app/reducers';
import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
} from '../../../features/question-answering/question-answering-actions';
import {getQuestionAnsweringInitialState} from '../../../features/question-answering/question-answering-state';
import {emptyQuestionAnswer} from '../../../features/search/search-state';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test/mock-engine';
import {buildMockRaw} from '../../../test/mock-raw';
import {buildMockResult} from '../../../test/mock-result';
import {buildMockSearchState} from '../../../test/mock-search-state';
import {
  SmartSnippetQuestionsListCore,
  buildCoreSmartSnippetQuestionsList,
} from './headless-core-smart-snippet-questions-list';

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
  let engine: MockSearchEngine;
  let smartSnippetQuestionsList: SmartSnippetQuestionsListCore;

  function initSmartSnippetQuestionsList() {
    smartSnippetQuestionsList = buildCoreSmartSnippetQuestionsList(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
    expect(engine.actions).toContainEqual(
      expandSmartSnippetRelatedQuestion({questionAnswerId: exampleId})
    );
  });

  it('#collapse dispatches #collapseSmartSnippetRelatedQuestion with the correct payload', () => {
    const exampleId = 'example id';
    smartSnippetQuestionsList.collapse(exampleId);
    expect(engine.actions).toContainEqual(
      collapseSmartSnippetRelatedQuestion({questionAnswerId: exampleId})
    );
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
    expect(engine.actions.length).toEqual(0);
  });
});
