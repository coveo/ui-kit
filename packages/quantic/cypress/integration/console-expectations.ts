import {ConsoleSelectors} from './console-selectors';

export const ConsoleExpectations = {
  error: (hasError: boolean) =>
    ConsoleSelectors.error().should(hasError ? 'be.called' : 'not.be.called'),
};
