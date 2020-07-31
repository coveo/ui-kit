import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';

/** The state relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];
export type ResultList = ReturnType<typeof buildResultList>;

export const buildResultList = (engine: Engine) => {
  const controller = buildController(engine);

  return {
    ...controller,

    /**
     * @returns The state of the `ResultList` controller.
     */
    get state() {
      const state = engine.state;

      return {
        results: state.search.response.results,
      };
    },
  };
};
