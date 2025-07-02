export class ChoiceIsNaNError extends Error {
  constructor(choice: string) {
    super(
      `The choice value "${choice}" from the "choicesDisplayed" option is not a number.`
    );
    this.name = 'ChoiceIsNaNError';
  }
}

export class InitialChoiceNotInChoicesError extends Error {
  constructor(initialChoice: number, choices: number[]) {
    super(
      `The initial choice value "${initialChoice}" is not included in the choices ${choices}.`
    );
    this.name = 'InitialChoiceNotInChoicesError';
  }
}

export class ChoiceIsNonPositiveError extends Error {
  constructor(choice: number) {
    super(
      `The choice value "${choice}" from the "choicesDisplayed" option is not positive (<= 0).`
    );
    this.name = 'ChoiceIsNonPositiveError';
  }
}
