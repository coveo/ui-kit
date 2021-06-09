import {Component, h, State, Prop} from '@stencil/core';
import {
  RelevanceInspector,
  RelevanceInspectorState,
  Unsubscribe,
  buildRelevanceInspector,
} from '@coveo/headless';
import {Bindings} from '../../utils/initialization-utils';

/**
 * The `atomic-relevance-inspector` component is used internally to offer insight on search page relevance, as well as information to help troubleshoot issues during development.
 */
@Component({
  tag: 'atomic-relevance-inspector',
  shadow: true,
})
export class AtomicRelevanceInspector {
  public relevanceInspector!: RelevanceInspector;
  private unsubscribe: Unsubscribe = () => {};

  @State() relevanceInspectorState!: RelevanceInspectorState;

  /**
   * The Atomic interface bindings, namely the headless search engine and i18n instances.
   */
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
