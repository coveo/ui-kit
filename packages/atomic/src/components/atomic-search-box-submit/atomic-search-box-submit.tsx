import {SearchBox} from '@coveo/headless';
import {Component, h, Prop} from '@stencil/core';
import {ParentController} from '../../utils/slot-utils';

@Component({
  tag: 'atomic-search-box-submit',
  styleUrl: 'atomic-search-box-submit.css',
  shadow: true,
})
export class AtomicSearchBoxSubmit {
  @Prop() @ParentController() controller!: SearchBox;

  render() {
    return (
      <button onClick={() => this.controller.submit()}>
        <slot>Search</slot>
      </button>
    );
  }
}
