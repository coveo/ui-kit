import {Engine} from '../../app/headless-engine';
import {SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';
import {Schema, ArrayValue, StringValue} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';

const optionsSchema = new Schema<ResultListOptions>({
  /**
   * A list of indexed fields to include in the objects returned by the result list.
   * These results are included in addition to the default fields.
   * If this is left empty only the default fields are included.
   */
  fieldsToInclude: new ArrayValue({
    required: false,
    each: new StringValue<string>({
      required: true,
      emptyAllowed: false,
    }),
  }),
});

type ResultListOptions = {
  fieldsToInclude?: string[];
};

type ResultListProps = {
  options?: ResultListOptions;
};

/** The state relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];
export type ResultList = ReturnType<typeof buildResultList>;

export function buildResultList(
  engine: Engine<SearchSection>,
  props?: ResultListProps
) {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    optionsSchema,
    props?.options,
    buildResultList.name
  );

  if (options.fieldsToInclude) {
    dispatch(registerFieldsToInclude(options.fieldsToInclude));
  }

  return {
    ...controller,

    /**
     * @returns The state of the `ResultList` controller.
     */
    get state() {
      const state = engine.state;

      return {
        results: state.search.response.results,
        isLoading: state.search.isLoading,
      };
    },
  };
}
