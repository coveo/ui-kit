/**
 * Represents a contextual value, which can be a string or an array of string.
 */
export type ContextValue = string | string[];

/**
 * Represents a key/value pair of contextual information.
 */
export type ContextPayload = Record<string, ContextValue>;

/**
 * Represent what Headless should do with a given context key.
 */
export interface ContextSettingEntry {
  useForML: boolean;
  useForReporting: boolean;
}

/**
 * Represent a key/value pair of setting regarding context keys.
 */
export type ContextSetting = Record<string, ContextSettingEntry>;

export type ContextState = {
  /**
   * Hold the contextual information that can be [leveraged by the Coveo platform to provide relevant results](https://docs.coveo.com/en/2081/coveo-machine-learning/understanding-custom-context).
   */
  contextValues: ContextPayload;
  /**
   * Hold the settings regarding where the context keys should be used (ML, reporting, both or none).
   * @internal
   */
  contextSettings: ContextSetting;
};

export function getContextInitialState(): ContextState {
  return {
    contextValues: {},
    contextSettings: {},
  };
}
