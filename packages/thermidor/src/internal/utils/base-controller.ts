import type {FullEngine} from '@/src/internal/engine/index.js';
import type {StateSelector, Unsubscribe} from '@/src/internal/engine/index.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

export abstract class BaseController<TState> implements Controller<TState> {
  get state(): TState {
    return this.engine.read(this.#stateSelector);
  }

  protected engine: FullEngine;

  #stateSelector: StateSelector<TState>;

  constructor(engine: FullEngine, stateSelector: StateSelector<TState>) {
    this.engine = engine;
    this.#stateSelector = stateSelector;
  }

  subscribe(callback: (state: TState) => void): Unsubscribe {
    return this.engine.subscribe(this.#stateSelector, callback);
  }
}
