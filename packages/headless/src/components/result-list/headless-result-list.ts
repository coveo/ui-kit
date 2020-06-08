import {Engine} from '../../app/headless-engine';
import {Component} from '../component/headless-component';

/** The state relevant to the `ResultList` component.*/
export type ResultListState = ResultList['state'];

export class ResultList extends Component {
  constructor(engine: Engine) {
    super(engine);
  }

  /**
   * @returns The state of the `ResultList` component.
   */
  public get state() {
    const state = this.engine.state;

    return {
      results: state.search.response.results,
    };
  }
}
