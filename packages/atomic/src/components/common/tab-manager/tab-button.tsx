import {Component, Host, Prop, h} from '@stencil/core';

/**
 * @internal
 */
@Component({
  tag: 'tab-manager-button',
})
export class TabManagerButton {
  /**
   * The label to display on the tab button.
   */
  @Prop() label!: string;

  /**
   * Whether the tab button is active.
   */
  @Prop() active: boolean = false;

  /**
   * Click handler for the tab button.
   */
  @Prop() select!: () => void;

  private get activeTabClass() {
    return this.active
      ? 'relative after:block after:w-full after:h-1 after:absolute after:-bottom-0.5 after:bg-primary after:rounded'
      : '';
  }

  private get activeTabTextClass() {
    return this.active ? '' : 'text-neutral-dark';
  }

  render() {
    return (
      <Host
        role="listitem"
        class={`${this.activeTabClass}`}
        aria-current={this.active ? 'true' : 'false'}
        aria-label={'tab for ' + this.label}
        part="button-container"
      >
        <button
          class={`w-full px-6 pb-1 text-xl ${this.activeTabTextClass}`}
          part="tab-button"
          onClick={this.select}
        >
          {this.label}
        </button>
      </Host>
    );
  }
}
