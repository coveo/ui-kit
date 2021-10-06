export type DictionaryFieldContextPayload = Record<string, string>;
export type DictionaryFieldContextState = {
  /**
   * Holds the [dictionary field context](https://docs.coveo.com/en/2036/index-content/about-fields#dictionary-fields) information.
   */
  contextValues: DictionaryFieldContextPayload;
};

export function getDictionaryFieldContextInitialState(): DictionaryFieldContextState {
  return {
    contextValues: {},
  };
}
