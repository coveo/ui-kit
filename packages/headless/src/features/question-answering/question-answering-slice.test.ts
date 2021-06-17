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
});
