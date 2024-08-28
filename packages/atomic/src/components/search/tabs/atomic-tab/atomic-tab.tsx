import {Component, Prop, Element} from '@stencil/core';

/**
 * @internal
 */
@Component({
  tag: 'atomic-tab',
  shadow: false,
})
export class AtomicTab {
  @Element() public host!: HTMLElement;

  /**
   * The label to display on the tab.
   */
  @Prop() label!: string;
  /**
   * The internal name of the atomic tab.
   */
  @Prop() name!: string;
  /**
   * The [constant query expression (`cq`)](https://docs.coveo.com/en/2830/searching-with-coveo/about-the-query-expression#constant-query-expression-cq) to apply when the tab is the active one.
   */
  @Prop() public expression: string = '';
}
