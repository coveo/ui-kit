import {Component, h, Prop} from '@stencil/core';

@Component({
  tag: 'atomic-modal',
  styleUrl: 'atomic-modal.pcss',
  shadow: true,
})
export class AtomicModal {
  @Prop() public handleClose!: () => void;

  render() {
    return (
      <div
        class="fixed inset-0 bg-blue-500 bg-opacity-90 w-full h-full z-10 p-16"
        onClick={() => this.handleClose()}
      >
        <div class="relative bg-white h-full max-w-5xl mx-auto">
          <button class="absolute text-white right-0 -top-6">X</button>
          <slot></slot>
        </div>
      </div>
    );
  }
}
