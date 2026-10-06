import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {
  createInteractiveSpotlightContentContextController,
  createSpotlightContentContextController,
} from '@/src/components/commerce/spotlight-content-template-component-utils/context/spotlight-content-context-controller';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {buildCustomEvent} from '@/src/utils/event-utils';
import '@/src/components/commerce/atomic-spotlight-content-text/atomic-spotlight-content-text';

/**
 * The `atomic-spotlight-content-link` component renders a link to the `clickUri` of a Spotlight Content item, and logs
 * Spotlight Content click analytics when it's selected.
 *
 * @part link - The anchor element.
 *
 * @slot default - The content to display inside the link. Defaults to the name of the Spotlight Content.
 * @slot attributes - Use `<a slot="attributes" target="_blank"></a>` to pass custom attributes to the generated link.
 */
@customElement('atomic-spotlight-content-link')
@bindings()
@withTailwindStyles
export class AtomicSpotlightContentLink
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = css`
    @reference '../../../utils/tailwind.global.tw.css';

    [part='link'] {
      @apply link-style;
      text-decoration: none;
    }
  `;

  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;
  @state() public spotlightContent?: SpotlightContent;
  @state() public interactiveSpotlightContent?: InteractiveSpotlightContent;
  @state() private linkAttributes?: Attr[];

  public spotlightContentController = createSpotlightContentContextController(this);
  public interactiveSpotlightContentController =
    createInteractiveSpotlightContentContextController(this);

  private stopPropagation?: boolean;
  private removeLinkEventHandlers?: () => void;

  public initialize() {
    if (!this.spotlightContent && this.spotlightContentController.item) {
      this.spotlightContent = this.spotlightContentController.item;
    }
    if (
      !this.interactiveSpotlightContent &&
      this.interactiveSpotlightContentController.interactiveItem
    ) {
      this.interactiveSpotlightContent = this.interactiveSpotlightContentController.interactiveItem;
    }

    this.dispatchEvent(
      buildCustomEvent('atomic/resolveStopPropagation', (stopPropagation: boolean) => {
        this.stopPropagation = stopPropagation;
      })
    );
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeLinkEventHandlers?.();
    this.removeLinkEventHandlers = undefined;
  }

  public willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);
    this.linkAttributes = getAttributesFromLinkSlotContent(this, 'attributes');
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.spotlightContent && this.interactiveSpotlightContent, () => {
      const interactiveSpotlightContent = this.interactiveSpotlightContent!;
      const withWarning = (action: () => void) => () => {
        this.logWarningIfNeeded(interactiveSpotlightContent.warningMessage);
        action();
      };

      return renderLinkWithItemAnalytics({
        props: {
          href: this.spotlightContent!.clickUri,
          part: 'link',
          attributes: this.linkAttributes,
          stopPropagation: this.stopPropagation,
          onSelect: withWarning(() => interactiveSpotlightContent.select()),
          onBeginDelayedSelect: withWarning(() => interactiveSpotlightContent.beginDelayedSelect()),
          onCancelPendingSelect: withWarning(() =>
            interactiveSpotlightContent.cancelPendingSelect()
          ),
          onInitializeLink: (cleanupCallback) => {
            this.removeLinkEventHandlers?.();
            this.removeLinkEventHandlers = cleanupCallback;
          },
        },
      })(
        html`<slot
          ><atomic-spotlight-content-text field="name"></atomic-spotlight-content-text
        ></slot>`
      );
    })}`;
  }

  private logWarningIfNeeded(warning?: string) {
    if (warning) {
      this.bindings.engine.logger.warn(warning);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-spotlight-content-link': AtomicSpotlightContentLink;
  }
}
