import {Component, Prop, h} from '@stencil/core';

/** The `atomic-component-error` is used by other components to return errors. This doesn't require any configuration.*/
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
