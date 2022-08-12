import {Component, Element, Prop, Watch} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {buildInsightLayout} from './insight-layout';

/**
 * The `atomic-insight-layout` helps organize elements in the page.
 */
@Component({
  tag: 'atomic-insight-layout',
  shadow: false,
})
export class AtomicInsightLayout {
  private styleTag?: HTMLStyleElement;
  @Element() private host!: HTMLElement;
  /**
   * Whether the interface should be shown in widget format.
   */
  @Prop({reflect: true, mutable: true}) public widget = false;

  @Watch('widget')
  public updateStyles() {
    if (this.styleTag) {
      this.styleTag.innerHTML = buildInsightLayout(this.host, this.widget);
    } else {
      this.makeStyleTag();
    }
  }

  private makeStyleTag() {
    this.styleTag = document.createElement('style');
    this.styleTag.innerHTML = buildInsightLayout(this.host, this.widget);
    this.host.appendChild(this.styleTag);
  }

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-insight-layout-');
    this.host.id = id;

    this.makeStyleTag();
  }
}
