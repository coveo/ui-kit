export type ContextValue = string | string[];
export type Context = Record<string, ContextValue>;
export type ContextState = {contextValues: Context};

export function getContextInitialState(): ContextState {
  return {
    contextValues: {},
  };
}
