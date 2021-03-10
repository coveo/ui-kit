import {Component, Prop, h} from '@stencil/core';

@Component({
  tag: 'atomic-component-error',
  styleUrl: 'atomic-component-error.pcss',
  shadow: true,
})
export class AtomicComponentError {
  @Prop() element!: HTMLElement;
  @Prop() error!: Error;

  connectedCallback() {
    console.error(this.error, this.element);
  }

  render() {
    return (
      <div class="text-error">
        <p>
          <b>{this.element.nodeName.toLowerCase()} component error</b>
        </p>
        <p>Look at the developer console for more information.</p>
      </div>
    );
  }
}
