import {Component, h, Prop, Element} from '@stencil/core';
import {
  buildInteractiveResult,
  InteractiveResult,
  Result,
} from '@coveo/headless';
import {ResultContext} from '../../result-template-components/result-template-decorators';
import {filterProtocol} from '../../../utils/xss-utils';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';

/**
 * The `atomic-result-link` component automatically transforms a search result title into a clickable link that points to the original item.
 * @part result-link - The result link
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
   * Where to display the linked URL, as the name for a browsing context (a tab, window, or <iframe>).
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
      <a
        part="result-link"
        href={filterProtocol(this.result.clickUri)}
        onClick={() => this.interactiveResult.select()}
        onContextMenu={() => this.interactiveResult.select()}
        onMouseDown={() => this.interactiveResult.select()}
        onMouseUp={() => this.interactiveResult.select()}
        onTouchStart={() => this.interactiveResult.beginDelayedSelect()}
        onTouchEnd={() => this.interactiveResult.cancelPendingSelect()}
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
      </a>
    );
  }
}
