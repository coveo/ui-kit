import {Engine} from '../../app/headless-engine';
import {ConfigurationSection, SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {fetchMoreResults} from '../../features/search/search-actions';

/** The state relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];
export type ResultList = ReturnType<typeof buildResultList>;

export const buildResultList = (
  engine: Engine<SearchSection & ConfigurationSection>
) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    /**
     * @returns The state of the `ResultList` controller.
     */
    get state() {
      const state = engine.state;

      return {
        results: state.search.results,
        isLoading: state.search.isLoading,
      };
    },
    fetchMoreResults() {
      dispatch(fetchMoreResults());
    },
  };
};
