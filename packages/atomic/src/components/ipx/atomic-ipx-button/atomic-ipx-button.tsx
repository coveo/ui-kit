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
        class="my-2 btn"
        onClick={() => this.onClick()}
      >
        <span class="btn-icon" part="button-icon">
          <atomic-icon
            class="svg-open"
            icon={this.getIcon(CloseIcon)}
          ></atomic-icon>
          <atomic-icon
            class="svg-close"
            icon={this.getIcon(SearchIcon)}
          ></atomic-icon>
        </span>
        <span class="buttonText" part="button-text">
          {this.label}
        </span>
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

  private get ipxLayout() {
    return document.querySelector('atomic-ipx-layout')!;
  }

  private open() {
    this.ipxLayout.style.height = `${Math.min(
      600,
      document.documentElement.clientHeight
    )}px`;
    this.ipxLayout.style.visibility = 'visible';
    this.ipxLayout.style.pointerEvents = 'initial';
    this.ipxLayout.style.opacity = '1';
    this.button?.classList.add('btn-open');
  }

  private close() {
    this.ipxLayout.style.visibility = 'hidden';
    this.ipxLayout.style.pointerEvents = 'none';
    this.ipxLayout.style.opacity = '0';
    this.button?.classList.remove('btn-open');
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
