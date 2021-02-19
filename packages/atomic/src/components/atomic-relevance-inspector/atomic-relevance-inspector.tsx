import {Component, h, State, Prop} from '@stencil/core';
import {
  RelevanceInspector,
  RelevanceInspectorState,
  Unsubscribe,
  buildRelevanceInspector,
} from '@coveo/headless';
import {Bindings} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-relevance-inspector',
  shadow: true,
})
export class AtomicRelevanceInspector {
  public relevanceInspector!: RelevanceInspector;
  private unsubscribe: Unsubscribe = () => {};

  @State() relevanceInspectorState!: RelevanceInspectorState;

  @Prop() bindings!: Bindings;

  constructor() {
    this.relevanceInspector = buildRelevanceInspector(this.bindings.engine, {
      initialState: {
        // TODO: add enable/disable mechanism
        enabled: false,
      },
    });
    this.unsubscribe = this.relevanceInspector.subscribe(
      () => (this.relevanceInspectorState = this.relevanceInspector.state)
    );
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    if (!this.relevanceInspectorState.isEnabled) {
      return;
    }

    // TODO: Display data in a cleaner manner
    return (
      <p>
        Debug mode is enabled. Look at the developper console to see additional
        information.
      </p>
    );
  }
}
