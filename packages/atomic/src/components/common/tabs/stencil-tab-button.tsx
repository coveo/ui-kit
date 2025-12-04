import {Component, Host, Prop, h} from '@stencil/core';
import {Button} from '../stencil-button';

/**
 * @internal
 */
@Component({
  tag: 'atomic-tab-button',
  styleUrl: 'tab-button.pcss',
})
export class AtomicTabButton {
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
        part={'button-container' + (this.active ? '-active' : '')}
      >
        <Button
          class={`w-full truncate px-2 pb-1 text-xl sm:px-6 hover:text-primary ${this.activeTabTextClass}`}
          part={'tab-button' + (this.active ? '-active' : '')}
          onClick={this.select}
          style="text-transparent"
        >
          {this.label}
        </Button>
      </Host>
    );
  }
}
