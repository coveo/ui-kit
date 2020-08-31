import {Component, h, State} from '@stencil/core';
import {
  History,
  HistoryState,
  Unsubscribe,
  buildHistory,
  Engine,
} from '@coveo/headless';
import {EngineProviderError, EngineProvider} from '../../utils/engine-utils';
import {RenderError} from '../../utils/render-utils';

@Component({
  tag: 'atomic-history',
  shadow: true,
})
export class AtomicHistory {
  @State() state!: HistoryState;
  @EngineProvider() engine!: Engine;
  @RenderError() error?: Error;

  private history!: History;
  private unsubscribe: Unsubscribe = () => {};

  public componentWillLoad() {
    try {
      this.configure();
    } catch (error) {
      this.error = error;
    }
  }

  private configure() {
    if (!this.engine) {
      throw new EngineProviderError('atomic-history');
    }

    this.history = buildHistory(this.engine);
    this.unsubscribe = this.history.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.history.state;
  }

  private back() {
    this.history.back();
  }

  private forward() {
    this.history.forward();
  }

  public render() {
    return (
      <div>
        <button onClick={() => this.back()}>BACK</button>
        <button onClick={() => this.forward()}>FORWARD</button>
      </div>
    );
  }
}
