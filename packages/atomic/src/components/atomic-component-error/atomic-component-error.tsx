import {Component, Prop, h} from '@stencil/core';

@Component({
  tag: 'atomic-component-error',
  styleUrl: 'atomic-component-error.css',
  shadow: true,
})
export class AtomicComponentError {
  @Prop() error!: Error;

  render() {
    return (
      <p>
        {this.error.name}
        <br />
        {this.error.message}
      </p>
    );
  }
}
