import {Engine} from '../../app/headless-engine';
import {Controller} from '../controller/headless-controller';
import {
  back,
  forward,
  logNavigateBackward,
  logNavigateForward,
} from '../../features/history/history-actions';
import {executeSearch} from '../../features/search/search-actions';

/** The state relevant to the `History` controller.*/
export type HistoryState = History['state'];

export class History extends Controller {
  constructor(engine: Engine) {
    super(engine);
  }

  /**
   * @returns The state of the `History` controller.
   */
  public get state() {
    const state = this.engine.state.history;
    return state;
  }

  public async back() {
    await this.dispatch(back());
    this.dispatch(executeSearch(logNavigateBackward()));
  }

  public async forward() {
    await this.dispatch(forward());
    this.dispatch(executeSearch(logNavigateForward()));
  }
}
