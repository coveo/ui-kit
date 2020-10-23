export interface FieldsState {
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
