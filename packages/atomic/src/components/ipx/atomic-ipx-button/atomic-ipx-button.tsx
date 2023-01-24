import {Component, Element, Fragment, h, Prop} from '@stencil/core';
import CloseIcon from '../../../images/close.svg';
import SearchIcon from '../../../images/search.svg';
import {Button} from '../../common/button';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-button',
  styleUrl: './atomic-ipx-button.pcss',
  shadow: true,
})
export class AtomicIPXButton {
  @Element() public host!: HTMLElement;

  /**
   * The label that will be shown to the user.
   */
  @Prop({reflect: true}) public label = 'Workplace Search';

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
          <atomic-icon
            part="ipx-close-icon"
            icon={this.getIcon(this.closeIcon)}
          ></atomic-icon>
          <atomic-icon
            part="ipx-open-icon"
            icon={this.getIcon(this.openIcon)}
          ></atomic-icon>
        </span>
        <span part="button-text">{this.label}</span>
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
    return document.querySelector('atomic-ipx-modal')!;
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
    initialDiv
      .querySelector('svg')
      ?.setAttribute('fill', 'var(--atomic-on-primary)');

    return initialDiv.innerHTML;
  }
}
