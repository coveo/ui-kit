import {isUndefined} from '@coveo/bueno';
import type {
  InteractiveResult,
  IPXActionsHistoryActionCreators,
} from '@coveo/headless';
import {loadIPXActionsHistoryActions} from '@coveo/headless';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import type {AnyUnfoldedItem} from '@/src/components/common/item-list/unfolded-item';
import type {RecsBindings} from '@/src/components/recommendations/atomic-recs-interface/atomic-recs-interface';
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
import styles from './atomic-ipx-result-link.tw.css';

/**
 * The `atomic-ipx-result-link` component automatically transforms a search result title into a clickable link that points to the original item.
 *
 * **Note:** This is an experimental internal component not intended for general use.
 *
 * @slot default - Lets you display alternative content inside the link
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes, to be used exclusively with an "a" tag such as `<a slot="attributes" target="_blank" download></a>`.
 */
@customElement('atomic-ipx-result-link')
@bindings()
export class AtomicIpxResultLink
  extends LightDomMixin(SlotsForNoShadowDOMMixin(LitElement))
  implements InitializableComponent<RecsBindings>
{
  static styles: CSSResultGroup = styles;

  /**
   * A template literal from which to generate the `href` attribute value (see
   * [Template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)).
   *
   * The template literal can reference any number of result properties from the parent result. It can also reference the window object.
   *
   * For example, the following markup generates an `href` value such as `http://uri.com?id=itemTitle`, using the result's `clickUri` and `itemtitle` fields.
   * ```html
   * <atomic-ipx-result-link href-template='${clickUri}?id=${raw.itemtitle}'></atomic-ipx-result-link>
   * ```
   */
  @property({reflect: true, attribute: 'href-template'})
  public hrefTemplate?: string;

  @state() public bindings!: RecsBindings;
  @state() public error!: Error;
  @state() private linkAttributes?: Attr[];
  @state() private stopPropagation?: boolean;
  @state() private result!: AnyUnfoldedItem;
  @state() private interactiveResult!: InteractiveResult;
  @state() private actionsHistoryActions?: IPXActionsHistoryActionCreators;
  private removeLinkEventHandlers?: () => void;

  private resultContext = createResultContextController(this);
  private interactiveResultContext =
    createInteractiveResultContextController(this);

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

    this.actionsHistoryActions = loadIPXActionsHistoryActions(
      this.bindings.engine
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.removeLinkEventHandlers) {
      this.removeLinkEventHandlers();
      this.removeLinkEventHandlers = undefined;
    }
  }

  private onSelect() {
    const resultPermanentId = this.result.raw.permanentid;
    if (resultPermanentId && this.actionsHistoryActions) {
      const action =
        this.actionsHistoryActions.addPageViewEntryInActionsHistory(
          resultPermanentId
        );
      this.bindings.engine.dispatch(action);
    }
    this.interactiveResult.select();
  }

  willUpdate() {
    this.linkAttributes = getAttributesFromLinkSlotContent(this, 'attributes');
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

      return renderLinkWithItemAnalytics({
        props: {
          href,
          onSelect: () => this.onSelect(),
          onBeginDelayedSelect: () => interactiveResult.beginDelayedSelect(),
          onCancelPendingSelect: () => interactiveResult.cancelPendingSelect(),
          attributes: this.linkAttributes,
          stopPropagation: this.stopPropagation,
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

export interface AtomicIpxResultLink extends LightDOMWithSlots {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-result-link': AtomicIpxResultLink;
  }
}
