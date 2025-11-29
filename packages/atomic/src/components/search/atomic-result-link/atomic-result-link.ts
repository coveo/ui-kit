import {isUndefined} from '@coveo/bueno';
import type {InteractiveResult, Result} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createInteractiveResultContextController} from '@/src/components/search/result-template-component-utils/context/interactive-result-context-controller';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {
  type LightDOMWithSlots,
  SlotsForNoShadowDOMMixin,
} from '@/src/mixins/slots-for-no-shadow-dom-mixin';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {buildStringTemplateFromResult} from '@/src/utils/result-utils';
import '@/src/components/search/atomic-result-text/atomic-result-text';

/**
 * The `atomic-result-link` component automatically transforms a search result title into a clickable link that points to the original item.
 * @slot default - Lets you display alternative content inside the link
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes, to be used exclusively with an "a" tag such as `<a slot="attributes" target="_blank" download></a>`.
 */
@customElement('atomic-result-link')
@bindings()
export class AtomicResultLink
  extends LightDomMixin(SlotsForNoShadowDOMMixin(LitElement))
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

  @state() private linkAttributes?: Attr[];
  @state() private stopPropagation?: boolean;
  @state() private result!: Result;
  @state() private interactiveResult!: InteractiveResult;
  private removeLinkEventHandlers?: () => void;

  private resultContext = createResultContextController(this);
  private interactiveResultContext =
    createInteractiveResultContextController(this);

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  public initialize() {
    if (!this.result && this.resultContext.item) {
      const item = this.resultContext.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }

    if (
      !this.interactiveResult &&
      this.interactiveResultContext.interactiveItem
    ) {
      this.interactiveResult = this.interactiveResultContext.interactiveItem;
    }

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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.removeLinkEventHandlers) {
      this.removeLinkEventHandlers();
      this.removeLinkEventHandlers = undefined;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.result && this.interactiveResult, () => {
      const result = this.result!;
      const interactiveResult = this.interactiveResult!;

      const href = isUndefined(this.hrefTemplate)
        ? result.clickUri
        : buildStringTemplateFromResult(
            this.hrefTemplate,
            result,
            this.bindings
          );

      this.linkAttributes = getAttributesFromLinkSlotContent(
        this,
        'attributes'
      );

      return renderLinkWithItemAnalytics({
        props: {
          href,
          onSelect: () => interactiveResult.select(),
          onBeginDelayedSelect: () => interactiveResult.beginDelayedSelect(),
          onCancelPendingSelect: () => interactiveResult.cancelPendingSelect(),
          attributes: this.linkAttributes,
          stopPropagation: this.stopPropagation,
          className: 'link-style',
          onInitializeLink: (cleanupCallback) => {
            if (this.removeLinkEventHandlers) {
              this.removeLinkEventHandlers();
            }
            this.removeLinkEventHandlers = cleanupCallback;
          },
        },
      })(html`
          ${this.renderDefaultSlotContent(
            html`<atomic-result-text
            field="title"
            default="no-title"
          ></atomic-result-text>`
          )}
        `);
    })}`;
  }
}

export interface AtomicResultLink extends LightDOMWithSlots {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-link': AtomicResultLink;
  }
}
