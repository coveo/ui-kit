import {Component, h, State} from '@stencil/core';
import {Pipeline, PipelineState, Unsubscribe} from '@coveo/headless';
import {headlessEngine} from '../../engine';

@Component({
  tag: 'atomic-pipeline',
  shadow: true,
})
export class AtomicPipeline {
  private pipeline: Pipeline;
  private unsubscribe: Unsubscribe;
  @State() state!: PipelineState;

  constructor() {
    this.pipeline = new Pipeline(headlessEngine);
    this.unsubscribe = this.pipeline.subscribe(() => this.updateState());
    this.pipeline.setPipeline('default');
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.pipeline.state;
  }

  public render() {
    return (
      <div>
        Current pipeline: {this.state.pipeline}
        <div>
          <input
            placeholder="Change pipeline..."
            onChange={(e) => this.inputChanged(e as KeyboardEvent)}
          />
        </div>
      </div>
    );
  }

  private inputChanged(e: KeyboardEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.pipeline.setPipeline(value);
  }
}
