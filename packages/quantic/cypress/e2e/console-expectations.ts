import {ConsoleSelectors} from './console-selectors';

export const ConsoleExpectations = {
  error: (hasError: boolean, message?: string) => {
    const assertion = ConsoleSelectors.error().should(
      hasError ? 'be.called' : 'not.be.called'
    );
    if (message) {
      return assertion.should(
        hasError ? 'be.calledWith' : 'not.be.calledWith',
        message
      );
    }
    return assertion;
  },
  warning: (hasWarning: boolean, message: string) =>
    ConsoleSelectors.warn().should(
      hasWarning ? 'be.calledWith' : 'not.be.calledWith',
      message
    ),
};
