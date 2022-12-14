import {Component, Element, h, Prop} from '@stencil/core';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';
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
   * Whether the IPX layout is open.
   */
  private isOpen = false;

  private async onClick() {
    this.isOpen ? this.close() : this.open();
    this.isOpen = !this.isOpen;

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
            icon={this.getIcon(CloseIcon)}
          ></atomic-icon>
          <atomic-icon
            part="ipx-search-icon"
            icon={this.getIcon(SearchIcon)}
          ></atomic-icon>
        </span>
        <span part="button-text">{this.label}</span>
      </Button>
    );
  }

  public render() {
    return (
      <div class="flex flex-col items-center" part="container">
        {this.renderIPXButton()}
      </div>
    );
  }

  private get button() {
    return this.host.shadowRoot!.querySelector('button');
  }

  private get ipxModal() {
    return document.querySelector('atomic-ipx-modal')!;
  }

  private open() {
    this.button?.classList.add('btn-open');
    this.ipxModal.setAttribute('is-open', 'true');
  }

  private close() {
    this.button?.classList.remove('btn-open');
    this.ipxModal.setAttribute('is-open', 'false');
  }

  private getIcon(icon: string) {
    const initialDiv = document.createElement('div')!;
    initialDiv.innerHTML = icon;
    initialDiv
      .querySelector('svg')
      ?.setAttribute('fill', 'var(--atomic-neutral-light)');

    return initialDiv.innerHTML;
  }
}
