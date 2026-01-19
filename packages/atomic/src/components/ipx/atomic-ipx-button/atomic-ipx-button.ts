import {loadRecommendationActions} from '@coveo/headless/recommendation';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import CloseIcon from '@/src/images/close.svg';
import SearchIcon from '@/src/images/search.svg';
import '@/src/components/common/atomic-icon/atomic-icon';

const numberOrPixelValuePattern = new RegExp(/^(?=.*(?:\d+|px)$).*$/);

/**
 * The `atomic-ipx-button` component represents a button that toggles the IPX modal.
 *
 * @part ipx-button - The main button element.
 * @part button-icon - The icon container within the button.
 * @part button-text - The text label within the button.
 * @part ipx-close-icon - The close icon.
 * @part ipx-open-icon - The open icon.
 * @part container - The container div.
 *
 * @cssprop --atomic-ipx-button-height - The height of the IPX button.
 */
@customElement('atomic-ipx-button')
@bindings()
@withTailwindStyles
export class AtomicIpxButton
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = css`
    @reference '../../../utils/tailwind.global.tw.css';

    :host {
      [part='ipx-button'] {
        @apply fixed right-12 bottom-1 px-3 whitespace-nowrap;
        height: var(--atomic-ipx-button-height, 2.75rem);
      }

      [part='button-icon'] {
        @apply relative inline-block h-4 w-4 p-0 align-middle;
        font-size: 100%;
      }

      [part='button-text'] {
        @apply ml-2 overflow-hidden;
      }

      [part='ipx-close-icon'],
      [part='ipx-open-icon'] {
        @apply absolute left-0;
        transition: transform 500ms;
      }
    }
  `;

  /**
   * The label that will be shown to the user.
   */
  @property({type: String, reflect: true}) public label?: string;

  /**
   * The close icon of the button.
   */
  @property({type: String, reflect: true}) public closeIcon = CloseIcon;

  /**
   * The open icon of the button.
   */
  @property({type: String, reflect: true}) public openIcon = SearchIcon;

  /**
   * Whether the IPX modal is open.
   */
  @property({type: Boolean, reflect: true, attribute: 'is-modal-open'})
  public isModalOpen = false;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  private recommendationsLoaded = false;

  public initialize() {}

  private async getRecommendations() {
    const recsEngine = this.bindings.interfaceElement.querySelector(
      'atomic-recs-interface'
    )?.engine;
    if (recsEngine) {
      this.recommendationsLoaded = true;
      recsEngine.dispatch(
        loadRecommendationActions(recsEngine).getRecommendations()
      );
    }
  }

  private async onClick() {
    if (!this.recommendationsLoaded) {
      await this.getRecommendations();
    }
    this.isModalOpen ? this.close() : this.open();
  }

  private renderIPXButton() {
    const ariaLabel = this.isModalOpen ? 'Close' : 'Open';

    return renderButton({
      props: {
        style: 'primary',
        part: 'ipx-button',
        class: 'my-2',
        onClick: () => this.onClick(),
        ariaLabel: this.label ?? ariaLabel,
        ariaExpanded: this.isModalOpen ? 'true' : 'false',
      },
    })(html`
      <span part="button-icon">
        <atomic-icon
          part="ipx-close-icon"
          .icon=${this.getIcon(this.closeIcon)}
        ></atomic-icon>
        <atomic-icon
          part="ipx-open-icon"
          .icon=${this.getIcon(this.openIcon)}
        ></atomic-icon>
      </span>
      ${when(this.label, () => html`<span part="button-text">${this.label}</span>`)}
    `);
  }

  render() {
    const [displayedIcon, hiddenIcon] = this.isModalOpen
      ? ['ipx-close-icon', 'ipx-open-icon']
      : ['ipx-open-icon', 'ipx-close-icon'];
    if (this.isModalOpen && !this.recommendationsLoaded) {
      this.getRecommendations();
    }

    return html`
      <style>
        [part=${displayedIcon}] {
          transform: translateY(0rem);
        }
        [part=${hiddenIcon}] {
          transform: translateY(3rem);
        }

        .btn-open {
          [part=${displayedIcon}] {
            transform: translateY(3rem);
          }

          [part=${hiddenIcon}] {
            transform: translateY(0rem);
          }
        }
      </style>
      <div class="flex flex-col items-center" part="container">
        ${this.renderIPXButton()}
      </div>
    `;
  }

  private get ipxModal() {
    return this.bindings?.interfaceElement?.querySelector('atomic-ipx-modal');
  }

  private open() {
    this.isModalOpen = true;
    this.classList.add('btn-open');
    this.ipxModal?.setAttribute('is-open', 'true');
  }

  private close() {
    this.isModalOpen = false;
    this.classList.remove('btn-open');
    this.ipxModal?.setAttribute('is-open', 'false');
  }

  private getIcon(icon: string) {
    const initialDiv = document.createElement('div')!;
    initialDiv.innerHTML = icon;
    const iconElement = initialDiv.querySelector('svg');
    if (!iconElement) {
      return initialDiv.innerHTML;
    }
    const iconWidth = this.getIconWidth(iconElement);
    const iconHeight = this.getIconHeight(iconElement);
    this.cleanupSVGStyles(iconElement);
    if (iconWidth && iconHeight) {
      iconElement.setAttribute('viewBox', `0 0 ${iconWidth} ${iconHeight}`);
    }
    return initialDiv.innerHTML;
  }

  private cleanupSVGStyles(iconElement: SVGSVGElement) {
    iconElement.removeAttribute('style');
    iconElement.removeAttribute('width');
    iconElement.removeAttribute('height');
  }

  private getIconWidth(icon: SVGSVGElement) {
    const width = icon.getAttribute('width') ?? '';
    if (numberOrPixelValuePattern.test(width)) {
      return width;
    }
    return null;
  }

  private getIconHeight(icon: SVGSVGElement) {
    const height = icon.getAttribute('height') ?? '';
    if (numberOrPixelValuePattern.test(height)) {
      return height;
    }
    return null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-button': AtomicIpxButton;
  }
}
