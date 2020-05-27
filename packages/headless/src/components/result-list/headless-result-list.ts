import {Engine} from '../../app/headless-engine';

export type ResultListState = ResultList['state'];

export class ResultList {
  constructor(private engine: Engine) {}

  /**
   * @returns The state of the `ResultList` component.
   */
  public get state() {
    const state = this.engine.state;

    return {
      results: state.search.response.results,
    };
  }

  /**
   * Adds a callback that will be called when component state changes.
   *
   * @param listener A callback to be invoked on every component state change.
   * @returns A function to remove this change listener.
   */
  public subscribe(listener: () => void) {
    listener();
    return this.engine.subscribe(listener);
  }
}
