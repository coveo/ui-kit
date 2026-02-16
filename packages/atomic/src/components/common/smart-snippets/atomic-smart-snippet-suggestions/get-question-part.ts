/**
 * Helper function to get the question part name based on the base and expanded state.
 */
export const getQuestionPart = (base: string, expanded: boolean): string =>
  `question-${base}-${expanded ? 'expanded' : 'collapsed'}`;
