import {FieldDescription} from '../../api/search/fields/fields-response';

export interface FieldsState {
  /**
   * The names of the fields to include with each item in the query results. If specified, no other fields will be included.
   *
   * Example: ["clickableuri","author","date","filetype","language","coversationid","messageid","childid","adjustednumberoflikes"]
   */
  fieldsToInclude: string[];
  /**
   * Flag that specify if all fields should be retrieved from the index. Useful in development or debugging scenarios.
   *
   * Should not be set to true in any production environment, as this can have a negative impact on query execution time.
   */
  debugFields: boolean;
  /**
   * The description of all available fields from the index.
   */
  fieldsDescription: FieldDescription[];
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
  debugFields: false,
  fieldsDescription: [],
});
