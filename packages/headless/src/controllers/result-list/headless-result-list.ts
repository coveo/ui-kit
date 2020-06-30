import {Engine} from '../../app/headless-engine';
import {Controller} from '../controller/headless-controller';

/** The state relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];

export class ResultList extends Controller {
  constructor(engine: Engine) {
    super(engine);
  }

  /**
   * @returns The state of the `ResultList` controller.
   */
  public get state() {
    const state = this.engine.state;

    return {
      results: state.search.response.results,
    };
  }
}
