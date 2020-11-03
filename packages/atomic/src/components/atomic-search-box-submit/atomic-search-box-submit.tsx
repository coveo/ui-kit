import {SearchBox} from '@coveo/headless';
import {Component, h, Prop} from '@stencil/core';
import {ParentController} from '../../utils/slot-utils';

/**
 * @slot - Content is placed inside the button element.
 *
 * @part button - Submit button
 */
@Component({
  tag: 'atomic-search-box-submit',
  styleUrl: 'atomic-search-box-submit.scss',
  shadow: true,
})
export class AtomicSearchBoxSubmit {
  @Prop() @ParentController() controller!: SearchBox;

  render() {
    return (
      <button
        type="button"
        class="btn rounded-0 rounded-right"
        onClick={() => this.controller.submit()}
        part="button"
      >
        <slot>Search</slot>
      </button>
    );
  }
}
