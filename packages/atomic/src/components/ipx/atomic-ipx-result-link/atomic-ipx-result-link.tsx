import {isUndefined} from '@coveo/bueno';
import {
  IPXActionsHistoryActionCreators,
  InteractiveResult,
  loadIPXActionsHistoryActions,
} from '@coveo/headless';
import {Component, h, Prop, Element} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {buildStringTemplateFromResult} from '../../../utils/result-utils';
import {getDefaultSlotContent} from '../../../utils/slot-utils';
import {AnyUnfoldedItem} from '../../common/item-list/unfolded-item';
import {getAttributesFromLinkSlotContent} from '../../common/item-link/attributes-slot';
import {LinkWithItemAnalytics} from '../../common/item-link/stencil-item-link';
import {RecsBindings} from '../../recommendations/atomic-recs-interface/atomic-recs-interface';
import {
  ResultContext,
  InteractiveResultContext,
} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

/**
 * The `atomic-ipx-result-link` component automatically transforms a search result title into a clickable link that points to the original item. It is an experimental internal component not intended for general use.
 * @slot default - Lets you display alternative content inside the link
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes, to be used exclusively with an "a" tag such as `<a slot="attributes" target="_blank" download></a>`.
 * @internal
 */
@Component({
  tag: 'atomic-ipx-result-link',
  styleUrl: 'atomic-ipx-result-link.pcss',
  shadow: false,
})
export class AtomicIPXResultLink
  implements InitializableComponent<RecsBindings>
{
  @InitializeBindings() public bindings!: RecsBindings;
  public error!: Error;

  @ResultContext() private result!: AnyUnfoldedItem;
  @InteractiveResultContext() private interactiveResult!: InteractiveResult;

  @Element() private host!: HTMLElement;

  /**
   * Specifies a template literal from which to generate the `href` attribute value (see
   * [Template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)).
   *
   * The template literal can reference any number of result properties from the parent result. It can also reference the window object.
   *
   * For example, the following markup generates an `href` value such as `http://uri.com?id=itemTitle`, using the result's `clickUri` and `itemtitle` fields.
   * ```html
   * <atomic-ipx-result-link href-template='${clickUri}?id=${raw.itemtitle}'></atomic-ipx-result-link>
   * ```
   */
  @Prop({reflect: true}) hrefTemplate?: string;

  private hasDefaultSlot!: boolean;
  private linkAttributes?: Attr[];
  private stopPropagation?: boolean;
  private actionsHistoryActions?: IPXActionsHistoryActionCreators;

  public initialize() {
    this.host.dispatchEvent(
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

  public connectedCallback() {
    const slotName = 'attributes';
    this.hasDefaultSlot =  getDefaultSlotContent(this.host).length > 0;
    this.linkAttributes = getAttributesFromLinkSlotContent(this.host, slotName);
  }

  public async onSelect() {
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

  public render() {
    const href = isUndefined(this.hrefTemplate)
      ? this.result.clickUri
      : buildStringTemplateFromResult(
          this.hrefTemplate,
          this.result,
          this.bindings
        );

    return (
      <LinkWithItemAnalytics
        href={href}
        onSelect={() => this.onSelect()}
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
      </LinkWithItemAnalytics>
    );
  }
}
