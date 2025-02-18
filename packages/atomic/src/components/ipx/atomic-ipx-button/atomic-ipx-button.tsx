import {loadRecommendationActions} from '@coveo/headless/recommendation';
import {Component, Element, Fragment, h, Prop, State} from '@stencil/core';
import CloseIcon from '../../../images/close.svg';
import SearchIcon from '../../../images/search.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Button} from '../../common/stencil-button';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

const numberOrPixelValuePattern = new RegExp(/^(?=.*(?:\d+|px)$).*$/);

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-button',
  styleUrl: './atomic-ipx-button.pcss',
  shadow: true,
})
export class AtomicIPXButton implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;

  @State() public error!: Error;

  @Element() public host!: HTMLElement;

  /**
   * The label that will be shown to the user.
   */
  @Prop({reflect: true}) public label?: string;

  /**
   * The close icon of the button.
   */
  @Prop({reflect: true}) public closeIcon = CloseIcon;

  /**
   * The open icon of the button.
   */
  @Prop({reflect: true}) public openIcon = SearchIcon;

  /**
   * Whether the IPX modal is open.
   */
  @Prop({mutable: true, reflect: true}) public isModalOpen = false;

  private recommendationsLoaded = false;

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
      this.getRecommendations();
    }
    this.isModalOpen ? this.close() : this.open();
    this.render();
  }

  private renderIPXButton() {
    return (
      <Button
        style="primary"
        part="ipx-button"
        class="my-2"
        onClick={() => this.onClick()}
      >
        <span part="button-icon">
          <atomic-icon
            part="ipx-close-icon"
            icon={this.getIcon(this.closeIcon)}
          ></atomic-icon>
          <atomic-icon
            part="ipx-open-icon"
            icon={this.getIcon(this.openIcon)}
          ></atomic-icon>
        </span>
        {this.label ? <span part="button-text">{this.label}</span> : null}
      </Button>
    );
  }

  public render() {
    const [displayedIcon, hiddenIcon] = this.isModalOpen
      ? ['ipx-close-icon', 'ipx-open-icon']
      : ['ipx-open-icon', 'ipx-close-icon'];
    if (this.isModalOpen && !this.recommendationsLoaded) {
      this.getRecommendations();
    }

    return (
      <Fragment>
        {
          <style>
            {`
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
              }`}
          </style>
        }
        <div class="flex flex-col items-center" part="container">
          {this.renderIPXButton()}
        </div>
      </Fragment>
    );
  }

  private get ipxModal() {
    return this.bindings.interfaceElement.querySelector('atomic-ipx-modal')!;
  }

  private open() {
    this.isModalOpen = true;
    this.host.classList.add('btn-open');
    this.ipxModal.setAttribute('is-open', 'true');
  }

  private close() {
    this.isModalOpen = false;
    this.host.classList.remove('btn-open');
    this.ipxModal.setAttribute('is-open', 'false');
  }

  private getIcon(icon: string) {
    const initialDiv = document.createElement('div')!;
    initialDiv.innerHTML = icon;
    const iconElement = initialDiv.querySelector('svg');
    if (!iconElement) {
      return initialDiv.innerHTML;
    }
    // here, we grab the icon width and height to set a viewbox (which keeps the svg looking normal), then remove styles from the icon to let the icon stretch into the space it is given.
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
