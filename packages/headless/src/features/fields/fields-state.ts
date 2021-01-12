export interface FieldsState {
  /**
   * The names of the fields to include with each item in the query results. If specified, no other fields will be included.
   *
   * Example: ["clickableuri","author","date","filetype","language","coversationid","messageid","childid","adjustednumberoflikes"]
   */
  fieldsToInclude: string[];
}

export const getFieldsInitialState: () => FieldsState = () => ({
  fieldsToInclude: [
    'author',
    'language',
    'urihash',
    'objecttype',
    'collection',
    'source',
    'permanentid',
  ],
});
