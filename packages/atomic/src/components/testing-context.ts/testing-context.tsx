import {Component, h, State} from '@stencil/core';
import {Context, ContextState, Unsubscribe} from '@coveo/headless';
import {headlessEngine} from '../../engine';

@Component({
  tag: 'atomic-testing-context',
  styleUrl: 'testing-context.css',
  shadow: true,
})
export class AtomicTestingContext {
  private context: Context;
  private unsubscribe: Unsubscribe;
  @State() state!: ContextState;

  constructor() {
    this.context = new Context(headlessEngine);
    this.unsubscribe = this.context.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    return (
      <div>
        <textarea>
          Current context: {JSON.stringify(this.state.contextValues)}
        </textarea>
        <button onClick={() => this.setContext()}>Set context</button>
        <button onClick={() => this.removeContext()}>Remove context</button>
        <button onClick={() => this.addContext()}>Add context</button>
      </div>
    );
  }

  private setContext() {
    this.context.setContext({
      foo: 'bar',
      buzz: ['1', '2', '3'],
      hello: 'not hello world',
    });
  }

  private removeContext() {
    this.context.removeContext('foo');
  }

  private addContext() {
    this.context.addContext('hello', 'world');
  }

  private updateState() {
    this.state = this.context.state;
  }
}
