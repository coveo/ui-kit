import {Engine} from '../../app/headless-engine';
import {Component} from '../component/headless-component';
import {
  Context as ContextPayload,
  ContextValue,
} from '../../features/context/context-slice';
import {
  setContext,
  addContext,
  removeContext,
} from '../../features/context/context-action';

/** The state relevant to the `Context` component.*/
export type ContextState = Context['state'];

export class Context extends Component {
  constructor(engine: Engine) {
    super(engine);
  }

  /**
   * @returns The state of the `Context` component.
   */
  public get state() {
    const state = this.engine.state;

    return {
      contextValues: state.context.contextValues,
    };
  }

  /**
   * Set the context for the query. Replace any existing context by the new one.
   * @param ctx The context to set in the query.
   */
  public setContext(ctx: ContextPayload) {
    this.dispatch(setContext(ctx));
  }

  /**
   * Add, or replace if already present, a new context key and value pair.
   * @param key The context key to add.
   * @param value The context value to add.
   */
  public addContext(key: string, value: ContextValue) {
    this.dispatch(addContext({contextKey: key, contextValue: value}));
  }

  /**
   * Remove a context key from the query.
   * @param key The context key to remove.
   */
  public removeContext(key: string) {
    this.dispatch(removeContext(key));
  }
}
