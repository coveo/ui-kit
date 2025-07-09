import type {QuestionsAnswers} from '../../../api/search/search/question-answering.js';
import {
  closeFeedbackModal,
  collapseSmartSnippet,
  dislikeSmartSnippet,
  expandSmartSnippet,
  likeSmartSnippet,
  openFeedbackModal,
} from '../../../features/question-answering/question-answering-actions.js';
import {
  type SmartSnippetFeedback,
  smartSnippetAnalyticsClient,
} from '../../../features/question-answering/question-answering-analytics-actions.js';
import {questionAnsweringReducer as questionAnswering} from '../../../features/question-answering/question-answering-slice.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import {emptyQuestionAnswer} from '../../../features/search/search-state.js';
import type {SearchAppState} from '../../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockSearchResponse} from '../../../test/mock-search-response.js';
import {buildMockSearchState} from '../../../test/mock-search-state.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreSmartSnippet,
  type SmartSnippetCore,
  type SmartSnippetState,
} from './headless-core-smart-snippet.js';

vi.mock('../../../features/question-answering/question-answering-actions');
vi.mock(
  '../../../features/question-answering/question-answering-analytics-actions'
);

describe('SmartSnippet', () => {
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let smartSnippet: SmartSnippetCore;

  beforeEach(() => {
    vi.resetAllMocks();
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
    engine = buildMockSearchEngine(state);
    smartSnippet = buildCoreSmartSnippet(engine, smartSnippetAnalyticsClient);
  }

  it('initializes', () => {
    expect(smartSnippet).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      questionAnswering,
      search,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(smartSnippet.subscribe).toBeTruthy();
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
    expect(engine.dispatch).not.toHaveBeenCalled();
  });

  it('#expand dispatches #expandSmartSnippet', () => {
    smartSnippet.expand();
    expect(expandSmartSnippet).toHaveBeenCalled();
  });

  it('#collapse dispatches #collapseSmartSnippet', () => {
    smartSnippet.collapse();
    expect(collapseSmartSnippet).toHaveBeenCalled();
  });

  it('#like dispatches #likeSmartSnippet', () => {
    smartSnippet.like();
    expect(likeSmartSnippet).toHaveBeenCalled();
  });

  it('#dislike dispatches #dislikeSmartSnippet', () => {
    smartSnippet.dislike();
    expect(dislikeSmartSnippet).toHaveBeenCalled();
  });

  it('#openFeedbackModal dispatches #openFeedbackModal', () => {
    smartSnippet.openFeedbackModal();
    expect(openFeedbackModal).toHaveBeenCalled();
  });

  it('#closeFeedbackModal dispatches #closeFeedbackModal', () => {
    smartSnippet.closeFeedbackModal();
    expect(closeFeedbackModal).toHaveBeenCalled();
  });

  it('#sendFeedback dispatches #closeFeedbackModal', () => {
    const mockFeedback: SmartSnippetFeedback = 'does_not_answer';
    smartSnippet.sendFeedback(mockFeedback);
    expect(closeFeedbackModal).toHaveBeenCalled();
  });

  it('#sendDetailedFeedback dispatches #closeFeedbackModal', () => {
    const mockFeedbackDetails = 'foo';
    smartSnippet.sendDetailedFeedback(mockFeedbackDetails);
    expect(closeFeedbackModal).toHaveBeenCalled();
  });

  it('#sendDetailedFeedback dispatches #closeFeedbackModal', () => {
    const mockFeedbackDetails = 'foo';
    smartSnippet.sendDetailedFeedback(mockFeedbackDetails);
    expect(closeFeedbackModal).toHaveBeenCalled();
  });
});
