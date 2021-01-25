import {Component, h} from '@stencil/core';
import {History, buildHistory} from '@coveo/headless';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-history',
  shadow: true,
})
export class AtomicHistory implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private history!: History;

  public initialize() {
    this.history = buildHistory(this.bindings.engine);
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
