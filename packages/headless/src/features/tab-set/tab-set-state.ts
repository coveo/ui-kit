export type TabSetState = Record<string, TabSlice>;

export type TabSlice = {
  id: string;
  expression: string;
  isActive: boolean;
};

export function getTabSetInitialState(): TabSetState {
  return {};
}
