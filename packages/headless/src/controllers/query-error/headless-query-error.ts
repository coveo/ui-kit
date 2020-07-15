import {Engine} from '../../app/headless-engine';
import {Controller} from '../controller/headless-controller';

/** The state relevant to the `QueryError` component.*/
export type QueryErrorState = QueryError['state'];

export class QueryError extends Controller {
  constructor(engine: Engine) {
    super(engine);
  }

  /**
   * @returns The state of the `QueryError` component.
   */
  public get state() {
    const state = this.engine.state;

    return {
      hasError: state.search.error !== null,
      error: state.search.error,
    };
  }
}
