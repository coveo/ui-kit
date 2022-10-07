import {Component, h, Prop, Element} from '@stencil/core';
import {
  buildInteractiveResult,
  InteractiveResult,
  Result,
} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {LinkWithResultAnalytics} from '../../result-link/result-link';
import {getAttributesFromLinkSlot} from '../../result-link/attributes-slot';
import {isUndefined} from '@coveo/bueno';
import {buildStringTemplateFromResult} from '../../../../utils/result-utils';
import {getDefaultSlotFromHost} from '../../../../utils/slot-utils';
import {buildCustomEvent} from '../../../../utils/event-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-result-link` component automatically transforms a search result title into a clickable link that points to the original item.
 * @slot default - Lets you display alternative content inside the link
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes, to be used exclusively with an "a" tag such as `<a slot="attributes" target="_blank" download></a>`.
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
   *
   * @deprecated Use the "attributes" slot instead to pass down attributes to the link.
   */
  @Prop({reflect: true}) target = '_self';

  /**
   * Specifies a template literal from which to generate the `href` attribute value (see
   * [Template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)).
   *
   * The template literal can reference any number of result properties from the parent result. It can also reference the window object.
   *
   * For example, the following markup generates an `href` value such as `http://uri.com?id=itemTitle`.
   * ```html
   * <atomic-result-link href-template='${clickUri}?id=${raw.itemtitle}'></atomic-result-link>
   * ```
   */
  @Prop({reflect: true}) hrefTemplate?: string;

  private interactiveResult!: InteractiveResult;
  private hasDefaultSlot!: boolean;
  private linkAttributes?: Attr[];
  private stopPropagation?: boolean;

  public initialize() {
    this.interactiveResult = buildInteractiveResult(this.bindings.engine, {
      options: {result: this.result},
    });
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/resolveStopPropagation',
        (stopPropagation: boolean) => {
          this.stopPropagation = stopPropagation;
        }
      )
    );
  }

  public connectedCallback() {
    const slotName = 'attributes';
    this.hasDefaultSlot = !!getDefaultSlotFromHost(this.host);
    this.linkAttributes = getAttributesFromLinkSlot(this.host, slotName);
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
        href={href}
        target={this.target}
        onSelect={() => this.interactiveResult.select()}
        onBeginDelayedSelect={() => this.interactiveResult.beginDelayedSelect()}
        onCancelPendingSelect={() =>
          this.interactiveResult.cancelPendingSelect()
        }
        attributes={this.linkAttributes}
        stopPropagation={this.stopPropagation}
      >
        {this.hasDefaultSlot ? (
          <slot />
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
