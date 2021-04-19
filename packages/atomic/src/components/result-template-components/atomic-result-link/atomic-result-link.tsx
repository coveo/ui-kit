import {Component, h, Prop, Element} from '@stencil/core';
import {Result} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {filterProtocol} from '../../../utils/xss-utils';

/**
 * The ResultLink component automatically transform a search result title into a clickable link pointing to the
 * original item.
 * @part result-link - The result link
 * @slot default - Allow to display alternative content inside the link
 */
@Component({
  tag: 'atomic-result-link',
  shadow: false,
})
export class AtomicResultValue {
  @ResultContext() private result!: Result;

  @Element() private host!: HTMLElement;

  /**
   * Where to display the linked URL, as the name for a browsing context (a tab, window, or <iframe>).
   *
   * The following keywords have special meanings for where to load the URL:
   * - _self: the current browsing context. (Default)
   * - _blank: usually a new tab, but users can configure browsers to open a new window instead.
   * - _parent: the parent browsing context of the current one. If no parent, behaves as _self.
   * - _top: the topmost browsing context (the "highest" context that’s an ancestor of the current one). If no ancestors, behaves as _self.
   */
  @Prop() target = '_self';

  private hasSlot!: boolean;

  public connectedCallback() {
    this.hasSlot = !!this.host.children.length;
  }

  public render() {
    return (
      <a
        part="result-link"
        href={filterProtocol(this.result.clickUri)}
        target={this.target}
        class="result-link"
      >
        {this.hasSlot ? (
          <slot></slot>
        ) : (
          <atomic-result-text
            field="title"
            default="noTitle"
          ></atomic-result-text>
        )}
      </a>
    );
  }
}
