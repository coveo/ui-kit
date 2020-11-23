import {Engine} from '../../app/headless-engine';
import {SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';

type ResultListOptions = {
  fieldsToInclude?: string[];
};

type ResultListProps = {
  options?: ResultListOptions;
};

/** The state relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];
export type ResultList = ReturnType<typeof buildResultList>;

export const buildResultList = (
  engine: Engine<SearchSection>,
  props?: ResultListProps
) => {
  const controller = buildController(engine);
  const {dispatch} = engine;
  if (props?.options?.fieldsToInclude) {
    dispatch(registerFieldsToInclude(props.options.fieldsToInclude));
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
};
