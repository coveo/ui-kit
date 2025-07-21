import {
  ChoiceIsNaNError,
  ChoiceIsNonPositiveError,
  InitialChoiceNotInChoicesError,
} from './error';

export function convertChoicesToNumbers(choices: string) {
  return choices.split(',').map((choice) => {
    const parsedChoice = parseInt(choice);
    if (Number.isNaN(parsedChoice)) {
      throw new ChoiceIsNaNError(choice);
    }
    if (parsedChoice <= 0) {
      throw new ChoiceIsNonPositiveError(parsedChoice);
    }

    return parsedChoice;
  });
}

export function validateInitialChoice(
  initialChoice: number,
  choices: number[]
): number {
  if (!choices.includes(initialChoice)) {
    throw new InitialChoiceNotInChoicesError(initialChoice, choices);
  }

  return initialChoice;
}
