import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {when} from 'lit/directives/when.js';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import type {ItemDisplayLayout} from '@/src/components/common/layout/item-layout-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint-utils';

interface SpotlightContentLogger {
  warn(message: string): void;
}

/**
 * The `atomic-commerce-spotlight-content` component displays a Spotlight Content item returned by the Commerce API.
 * It is used internally by the `atomic-commerce-product-list` component when the `enable-spotlight-content` property
 * of the `atomic-commerce-interface` component is set.
 *
 * @part link - The anchor element wrapping the whole spotlight content.
 * @part image - The spotlight content image.
 * @part body - The element containing the name and description of the spotlight content.
 * @part name - The name of the spotlight content.
 * @part description - The description of the spotlight content.
 */
@customElement('atomic-commerce-spotlight-content')
@withTailwindStyles
export class AtomicCommerceSpotlightContent extends LitElement {
  static styles: CSSResultGroup = css`
    @reference '../../../utils/tailwind.global.tw.css';

    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    [part='link'] {
      @apply rounded-lg focus-visible:outline-primary relative flex h-full w-full flex-col overflow-hidden no-underline outline-offset-2;
    }

    [part='image'] {
      @apply block h-full w-full object-cover;
    }

    [part='body'] {
      @apply text-on-background flex flex-col gap-1 p-4;
    }

    [part='name'] {
      @apply text-lg font-bold;
    }

    [part='description'] {
      @apply m-0 text-base;
    }
  `;

  /**
   * The spotlight content to display.
   */
  @property({type: Object, attribute: false})
  spotlightContent!: SpotlightContent;

  /**
   * The `InteractiveSpotlightContent` sub-controller used to log analytics when the spotlight content is selected.
   */
  @property({type: Object, attribute: false})
  interactiveSpotlightContent!: InteractiveSpotlightContent;

  /**
   * The layout used by the parent list.
   */
  @property({reflect: true, type: String})
  display: ItemDisplayLayout = 'grid';

  /**
   * The viewport width under which the mobile image is displayed, when available.
   */
  @property({type: String, attribute: 'mobile-breakpoint'})
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT;

  /**
   * The logger used to report missing analytics metadata.
   */
  @property({type: Object, attribute: false})
  logger?: SpotlightContentLogger;

  private removeLinkEventHandlers?: () => void;

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeLinkEventHandlers?.();
    this.removeLinkEventHandlers = undefined;
  }

  render() {
    if (!this.spotlightContent || !this.interactiveSpotlightContent) {
      return html``;
    }

    const {clickUri, name, description} = this.spotlightContent;
    const interactiveSpotlightContent = this.interactiveSpotlightContent;
    const withWarning = (action: () => void) => () => {
      this.logWarningIfNeeded();
      action();
    };

    return renderLinkWithItemAnalytics({
      props: {
        href: clickUri,
        part: 'link',
        onSelect: withWarning(() => interactiveSpotlightContent.select()),
        onBeginDelayedSelect: withWarning(() => interactiveSpotlightContent.beginDelayedSelect()),
        onCancelPendingSelect: withWarning(() => interactiveSpotlightContent.cancelPendingSelect()),
        onInitializeLink: (cleanupCallback) => {
          this.removeLinkEventHandlers?.();
          this.removeLinkEventHandlers = cleanupCallback;
        },
      },
    })(html`
      ${this.renderImage()}
      ${when(
        name || description,
        () => html`
          <div part="body">
            ${when(
              name,
              () =>
                html`<span
                  part="name"
                  style=${styleMap({color: this.spotlightContent.nameFontColor})}
                  >${name}</span
                >`
            )}
            ${when(
              description,
              () =>
                html`<p
                  part="description"
                  style=${styleMap({color: this.spotlightContent.descriptionFontColor})}
                >
                  ${description}
                </p>`
            )}
          </div>
        `
      )}
    `);
  }

  private renderImage() {
    const {desktopImage, mobileImage, altText, name} = this.spotlightContent;

    return html`<picture>
      ${when(
        mobileImage,
        () => html`<source media="(width < ${this.mobileBreakpoint})" srcset=${mobileImage!} />`
      )}
      <img part="image" src=${desktopImage} alt=${altText ?? name ?? ''} loading="lazy" />
    </picture>`;
  }

  private handleClick = () => {
    this.shadowRoot?.querySelector<HTMLAnchorElement>('a[part="link"]')?.click();
  };

  private logWarningIfNeeded() {
    const {warningMessage} = this.interactiveSpotlightContent;
    if (warningMessage) {
      this.logger?.warn(warningMessage);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-spotlight-content': AtomicCommerceSpotlightContent;
  }
}
