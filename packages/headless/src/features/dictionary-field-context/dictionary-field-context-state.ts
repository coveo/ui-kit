export type DictionaryFieldContextPayload = Record<string, string>;
export type DictionaryFieldContextState = {
  /**
   * Holds the [dictionary field context](https://docs.coveo.com/en/2036/) information.
   */
  contextValues: DictionaryFieldContextPayload;
};

export function getDictionaryFieldContextInitialState(): DictionaryFieldContextState {
  return {
    contextValues: {},
  };
}
