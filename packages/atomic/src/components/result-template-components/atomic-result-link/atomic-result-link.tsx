import {Component, h, Prop, Element} from '@stencil/core';
import {
  buildInteractiveResult,
  InteractiveResult,
  Result,
} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {LinkWithResultAnalytics} from '../../result-link/result-link';
import {isUndefined} from '@coveo/bueno';
import {buildStringTemplateFromResult} from '../../../utils/result-utils';

/**
 * The `atomic-result-link` component automatically transforms a search result title into a clickable link that points to the original item.
 * @slot default - Allow to display alternative content inside the link
 * @slot attributes - Allows to pass attributes down to the link element, overriding other attributes, to be used exclusively with "a" tags.
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
  @Prop({reflect: true}) target = '_self';

  /**
   * Specifies a template literal from which to generate the `href` attribute value (see
   * [Template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)).
   *
   * The template literal can reference any number of result properties from the parent result. It can also reference the window object.
   *
   * @example
   * The following markup generates an `href` value such as `http://uri.com?id=itemTitle`:
   * <atomic-result-link href-template='${clickUri}?id=${raw.itemtitle}'></atomic-result-link>
   */
  @Prop({reflect: true}) hrefTemplate?: string;

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
    const href = isUndefined(this.hrefTemplate)
      ? this.result.clickUri
      : buildStringTemplateFromResult(
          this.hrefTemplate,
          this.result,
          this.bindings
        );

    return (
      <LinkWithResultAnalytics
        interactiveResult={this.interactiveResult}
        href={href}
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
