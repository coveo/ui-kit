export interface DefaultConstantQueryFilterState {
  /**
   * The default constant query filter.
   */
  defaultValue: string;
  /**
   * Whether the constant query filter was ever explicitly changed.
   */
  actualValueWasChanged: boolean;
}

export const getDefaultConstantQueryFilterInitialState: () => DefaultConstantQueryFilterState = () => ({
  defaultValue: '',
  actualValueWasChanged: false,
});
