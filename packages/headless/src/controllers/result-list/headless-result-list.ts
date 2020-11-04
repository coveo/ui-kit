import {Engine} from '../../app/headless-engine';
import {SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {flatten} from '../../utils/utils';

/** The state relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];
export type ResultList = ReturnType<typeof buildResultList>;

export const buildResultList = (engine: Engine<SearchSection>) => {
  const controller = buildController(engine);

  return {
    ...controller,

    /**
     * @returns The state of the `ResultList` controller.
     */
    get state() {
      const state = engine.state;

      return {
        results: flatten(
          [...state.search.pastResponses, state.search.response].map(
            (response) => response.results
          )
        ),
        isLoading: state.search.isLoading,
      };
    },
  };
};
