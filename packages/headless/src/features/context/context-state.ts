/**
 * Represents a contextual value, which can be a string or an array of string.
 */
export type ContextValue = string | string[];
/**
 * Represents a key/value pair of contextual information.
 */
export type ContextPayload = Record<string, ContextValue>;
export type ContextState = {
  /**
   * Hold the contextual information that can be [leveraged by the Coveo platform to provide relevant results](https://docs.coveo.com/en/2081/coveo-machine-learning/understanding-custom-context).ƒ
   */
  contextValues: ContextPayload;
};

export function getContextInitialState(): ContextState {
  return {
    contextValues: {},
  };
}
