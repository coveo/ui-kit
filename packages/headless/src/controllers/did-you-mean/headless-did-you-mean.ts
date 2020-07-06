import {Engine} from '../../app/headless-engine';
import {Controller} from '../controller/headless-controller';
import {
  enableDidYouMean,
  didYouMeanCorrection,
} from '../../features/did-you-mean/did-you-mean-actions';
import {updateQuery} from '../../features/query/query-actions';
import {logDidYouMeanClick} from '../../features/did-you-mean/did-you-mean-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';

/** The state relevant to the `DidYouMean` controller.*/
export type DidYouMeanState = DidYouMean['state'];

/**
 * The DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller either suggests the correction or
 * automatically triggers a new query with the suggested term.
 */
export class DidYouMean extends Controller {
  constructor(engine: Engine) {
    super(engine);
    this.dispatch(enableDidYouMean());
  }

  /**
   * @returns The state of the `DidYouMean` controller.
   */
  public get state() {
    const state = this.engine.state;

    return {
      ...state.didYouMean,
      hasQueryCorrection:
        state.didYouMean.queryCorrection.correctedQuery !== '' ||
        state.didYouMean.wasCorrectedTo !== '',
    };
  }

  public applyCorrection() {
    this.dispatch(updateQuery({q: this.state.queryCorrection.correctedQuery}));
    this.dispatch(
      didYouMeanCorrection(this.state.queryCorrection.correctedQuery)
    );
    this.dispatch(executeSearch(logDidYouMeanClick()));
  }
}
