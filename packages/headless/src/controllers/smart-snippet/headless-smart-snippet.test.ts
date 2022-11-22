import {SmartSnippetState} from '../..';
import {QuestionsAnswers} from '../../api/search/search/question-answering';
import {questionAnswering, search} from '../../app/reducers';
import {emptyQuestionAnswer} from '../../features/search/search-state';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {createMockState} from '../../test/mock-state';
import {SmartSnippet, buildSmartSnippet} from './headless-smart-snippet';

describe('smartSnippet', () => {
  let state: SearchAppState;

  let engine: MockSearchEngine;
  let smartSnippet: SmartSnippet;

  beforeEach(() => {
    initState();
    initController();
  });

  function initState(questionAnswerState: Partial<QuestionsAnswers> = {}) {
    state = createMockState({
      search: buildMockSearchState({
        response: buildMockSearchResponse({
          questionAnswer: {...emptyQuestionAnswer(), ...questionAnswerState},
        }),
      }),
    });
  }

  function initController() {
    engine = buildMockSearchAppEngine({state});
    smartSnippet = buildSmartSnippet(engine);
  }

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      questionAnswering,
      search,
    });
  });

  it('should return the right state', () => {
    expect(smartSnippet.state).toEqual(<SmartSnippetState>{
      question: '',
      answer: '',
      documentId: {contentIdKey: '', contentIdValue: ''},
      expanded: false,
      answerFound: false,
      liked: false,
      disliked: false,
      feedbackModalOpen: false,
    });
  });

  it('should not dispatch any action at initialization', () => {
    expect(engine.actions.length).toEqual(0);
  });
});
