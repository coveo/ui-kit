import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../utils/result-section-utils';

/**
  TODO:
 */
@Component({
  tag: 'atomic-result-section-children',
  shadow: false,
})
export class AtomicResultChildrenEmphasized {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
