export type GeneratedAnswerStyle = 'default' | 'bullet' | 'step' | 'concise';

export interface GeneratedResponseFormat {
  answerStyle: GeneratedAnswerStyle;
}
