import {ConsoleSelectors} from './console-selectors';

export const ConsoleExpectations = {
  error: (hasError: boolean) =>
    ConsoleSelectors.error().should(hasError ? 'be.called' : 'not.be.called'),
  warning: (hasError: boolean) =>
    ConsoleSelectors.warn().should(hasError ? 'be.called' : 'not.be.called'),
};
