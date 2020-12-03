import {Component, h, State, Prop} from '@stencil/core';
import {
  RelevanceInspector,
  RelevanceInspectorState,
  Unsubscribe,
  buildRelevanceInspector,
  Engine,
} from '@coveo/headless';

@Component({
  tag: 'atomic-relevance-inspector',
  shadow: true,
})
export class AtomicRelevanceInspector {
  @State() state!: RelevanceInspectorState;
  @Prop() engine!: Engine;

  private relevanceInspector!: RelevanceInspector;
  private unsubscribe: Unsubscribe = () => {};

  constructor() {
    this.relevanceInspector = buildRelevanceInspector(this.engine, {
      initialState: {
        // TODO: add enable/disable mechanism
        enabled: true,
      },
    });
    this.unsubscribe = this.relevanceInspector.subscribe(() =>
      this.updateState()
    );
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.relevanceInspector.state;
  }

  public render() {
    if (!this.state.isEnabled) {
      return;
    }

    // TODO: Display data in a cleaner manner
    return <div>{JSON.stringify(this.relevanceInspector.state)}</div>;
  }
}
