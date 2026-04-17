export function hasDisplayableGeneratedAnswerText(
  answer?: string
): answer is string {
  return typeof answer === 'string' && answer.trim() !== '';
}

export function appendGeneratedAnswerText(
  answer: string | undefined,
  textDelta: string
): string | undefined {
  if (!hasDisplayableGeneratedAnswerText(answer)) {
    return textDelta.trim() === '' ? undefined : textDelta;
  }

  return answer.concat(textDelta);
}
