export type DictionaryFieldContextState = {
  /**
   * Holds the [dictionary field context](https://docs.coveo.com/en/2036/index-content/about-fields#dictionary-fields) information.
   */
  contextValues: Record<string, string>;
};

export function getDictionaryFieldContextInitialState(): DictionaryFieldContextState {
  return {
    contextValues: {},
  };
}
