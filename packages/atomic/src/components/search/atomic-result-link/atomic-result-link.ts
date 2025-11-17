import {isUndefined} from '@coveo/bueno';
import type {InteractiveResult} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import type {AnyUnfoldedItem} from '@/src/components/common/item-list/unfolded-item';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createInteractiveResultContextController} from '@/src/components/search/result-template-component-utils/context/interactive-result-context-controller';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {buildStringTemplateFromResult} from '@/src/utils/result-utils';
import {getDefaultSlotContent} from '@/src/utils/slot-utils';
import '@/src/components/search/atomic-result-text/atomic-result-text';

/**
 * The `atomic-result-link` component automatically transforms a search result title into a clickable link that points to the original item.
 * @slot default - Lets you display alternative content inside the link
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes, to be used exclusively with an "a" tag such as `<a slot="attributes" target="_blank" download></a>`.
 */
@customElement('atomic-result-link')
@bindings()
@withTailwindStyles
export class AtomicResultLink
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup =
    css`@reference '../../../../utils/tailwind.global.tw.css';

atomic-result-link {
  a {
    @apply link-style;
  }
}`;

  /**
   * Specifies a template literal from which to generate the `href` attribute value (see
   * [Template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)).
   *
   * The template literal can reference any number of result properties from the parent result. It can also reference the window object.
   *
   * For example, the following markup generates an `href` value such as `http://uri.com?id=itemTitle`, using the result's `clickUri` and `itemtitle` fields.
   * ```html
   * <atomic-result-link href-template='${clickUri}?id=${raw.itemtitle}'></atomic-result-link>
   * ```
   */
  @property({reflect: true, attribute: 'href-template'})
  public hrefTemplate?: string;

  @state() private hasDefaultSlot = false;
  @state() private linkAttributes?: Attr[];
  @state() private stopPropagation?: boolean;

  private resultContext = createResultContextController(this);
  private interactiveResultContext =
    createInteractiveResultContextController(this);

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public initialize() {
    this.dispatchEvent(
      buildCustomEvent(
        'atomic/resolveStopPropagation',
        (stopPropagation: boolean) => {
          this.stopPropagation = stopPropagation;
        }
      )
    );
  }

  connectedCallback() {
    super.connectedCallback();
    const slotName = 'attributes';
    this.hasDefaultSlot = getDefaultSlotContent(this).length > 0;
    this.linkAttributes = getAttributesFromLinkSlotContent(this, slotName);
  }

  render() {
    const href = isUndefined(this.hrefTemplate)
      ? this.result.clickUri
      : buildStringTemplateFromResult(
          this.hrefTemplate,
          this.result,
          this.bindings
        );

    return renderLinkWithItemAnalytics({
      props: {
        href,
        onSelect: () => this.interactiveResult.select(),
        onBeginDelayedSelect: () => this.interactiveResult.beginDelayedSelect(),
        onCancelPendingSelect: () =>
          this.interactiveResult.cancelPendingSelect(),
        attributes: this.linkAttributes,
        stopPropagation: this.stopPropagation,
        className: 'link-style',
      },
    })(html`
      ${
        this.hasDefaultSlot
          ? html`<slot></slot>`
          : html`<atomic-result-text
            field="title"
            default="no-title"
          ></atomic-result-text>`
      }
    `);
  }

  private get result(): AnyUnfoldedItem {
    return this.resultContext.item as AnyUnfoldedItem;
  }

  private get interactiveResult(): InteractiveResult {
    return this.interactiveResultContext.interactiveItem as InteractiveResult;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-link': AtomicResultLink;
  }
}
