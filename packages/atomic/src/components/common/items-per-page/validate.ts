import {AtomicCommerceProductsPerPage} from '../../commerce/atomic-commerce-products-per-page/atomic-commerce-products-per-page';
import {AtomicResultsPerPage} from '../../search/atomic-results-per-page/atomic-results-per-page';

export function validateChoicesDisplayed(
  context: AtomicResultsPerPage | AtomicCommerceProductsPerPage
) {
  return context.choicesDisplayed.split(',').map((choice) => {
    const parsedChoice = parseInt(choice);
    if (isNaN(parsedChoice)) {
      const errorMsg = `The choice value "${choice}" from the "choicesDisplayed" option is not a number.`;
      context.bindings.engine.logger.error(errorMsg, context);
      throw new Error(errorMsg);
    }

    return parsedChoice;
  });
}

export function validateInitialChoice(
  context: AtomicResultsPerPage | AtomicCommerceProductsPerPage,
  choices: number[]
) {
  if (!context.initialChoice) {
    context.initialChoice = choices[0];
    return;
  }
  if (!choices.includes(context.initialChoice)) {
    const errorMsg = `The "initialChoice" option value "${context.initialChoice}" is not included in the "choicesDisplayed" option "${context.choicesDisplayed}".`;
    context.bindings.engine.logger.error(errorMsg, context);
    throw new Error(errorMsg);
  }
}
