import {Component, h, State, Prop} from '@stencil/core';
import {
  RelevanceInspector,
  RelevanceInspectorState,
  Unsubscribe,
  buildRelevanceInspector,
} from '@coveo/headless';
import {
  AtomicComponentInterface,
  Bindings,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-relevance-inspector',
  shadow: true,
})
export class AtomicRelevanceInspector implements AtomicComponentInterface {
  @State() controllerState!: RelevanceInspectorState;
  @Prop() bindings!: Bindings;

  public controller!: RelevanceInspector;
  private unsubscribe: Unsubscribe = () => {};

  constructor() {
    this.controller = buildRelevanceInspector(this.bindings.engine, {
      initialState: {
        // TODO: add enable/disable mechanism
        enabled: false,
      },
    });
    this.unsubscribe = this.controller.subscribe(
      () => (this.controllerState = this.controller.state)
    );
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    if (!this.controllerState.isEnabled) {
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
