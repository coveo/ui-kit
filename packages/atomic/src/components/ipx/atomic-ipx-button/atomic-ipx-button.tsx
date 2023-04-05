import {Component, Element, Fragment, h, Prop, State} from '@stencil/core';
import {btoa} from 'abab';
import CloseIcon from '../../../images/close.svg';
import SearchIcon from '../../../images/search.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Button} from '../../common/button';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

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

  private async onClick() {
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
          <img
            part="ipx-close-icon"
            src={`data:image/svg+xml;base64,${btoa(
              this.getIcon(this.closeIcon)
            )}`}
          />
          <img
            part="ipx-open-icon"
            src={`data:image/svg+xml;base64,${btoa(
              this.getIcon(this.openIcon)
            )}`}
          />
        </span>
        {this.label && <span part="button-text">{this.label}</span>}
      </Button>
    );
  }

  public render() {
    const [displayedIcon, hiddenIcon] = this.isModalOpen
      ? ['ipx-close-icon', 'ipx-open-icon']
      : ['ipx-open-icon', 'ipx-close-icon'];

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

    const svgColor = getComputedStyle(document.body).getPropertyValue(
      '--atomic-on-primary'
    );
    initialDiv.querySelector('svg')?.setAttribute('fill', svgColor);

    return initialDiv.innerHTML;
  }
}
