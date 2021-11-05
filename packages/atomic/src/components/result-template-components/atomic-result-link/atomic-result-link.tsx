import {Component, h, Prop, Element} from '@stencil/core';
import {
  buildInteractiveResult,
  InteractiveResult,
  Result,
} from '@coveo/headless';
import {ResultContext} from '../../result-template-components/result-template-decorators';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {LinkWithResultAnalytics} from '../../result-link/result-link';

/**
 * The `atomic-result-link` component automatically transforms a search result title into a clickable link that points to the original item.
 * @slot default - Allow to display alternative content inside the link
 */
@Component({
  tag: 'atomic-result-link',
  styleUrl: 'atomic-result-link.pcss',
  shadow: false,
})
export class AtomicResultLink implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public error!: Error;

  @ResultContext() private result!: Result;

  @Element() private host!: HTMLElement;

  /**
   * Where to open the linked URL, as the name for a browsing context (a tab, window, or iframe).
   *
   * The following keywords have special meanings:
   *
   * * _self: the current browsing context. (Default)
   * * _blank: usually a new tab, but users can configure their browsers to open a new window instead.
   * * _parent: the parent of the current browsing context. If there's no parent, this behaves as `_self`.
   * * _top: the topmost browsing context (the "highest" context that’s an ancestor of the current one). If there are no ancestors, this behaves as `_self`.
   */
  @Prop() target = '_self';

  private interactiveResult!: InteractiveResult;
  private hasSlot!: boolean;

  public initialize() {
    this.interactiveResult = buildInteractiveResult(this.bindings.engine, {
      options: {result: this.result},
    });
  }

  public connectedCallback() {
    this.hasSlot = !!this.host.children.length;
  }

  public render() {
    return (
      <LinkWithResultAnalytics
        interactiveResult={this.interactiveResult}
        href={this.result.clickUri}
        target={this.target}
      >
        {this.hasSlot ? (
          <slot></slot>
        ) : (
          <atomic-result-text
            field="title"
            default="no-title"
          ></atomic-result-text>
        )}
      </LinkWithResultAnalytics>
    );
  }
}
