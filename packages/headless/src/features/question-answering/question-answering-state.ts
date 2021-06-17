export interface QuestionAnsweringState {
  /**
   * Determines if the snippet is liked, or upvoted by the end user.
   */
  liked: boolean;
  /**
   * Determines if the snippet is disliked, or downvoted by the end user.
   */
  disliked: boolean;
  /**
   * Determines if the snippet is expanded.
   */
  expanded: boolean;
}

export const getQuestionAnsweringInitialState: () => QuestionAnsweringState = () => ({
  liked: false,
  disliked: false,
  expanded: false,
});
