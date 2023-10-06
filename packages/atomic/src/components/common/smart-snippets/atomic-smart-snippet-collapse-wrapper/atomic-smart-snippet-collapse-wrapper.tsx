import {Component, h, Element, State, Prop, Host} from '@stencil/core';
import ArrowDown from '../../../../images/arrow-down.svg';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {AnyBindings} from '../../interface/bindings';

/**
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-collapse-wrapper',
  styleUrl: 'atomic-smart-snippet-collapse-wrapper.pcss',
  shadow: true,
})
export class AtomicSmartSnippetCollapseWrapper {
  @InitializeBindings() public bindings!: AnyBindings;
  public error!: Error;
  @Element() public host!: HTMLElement;

  @Prop({reflect: true}) public maximumHeight?: number;

  @Prop({reflect: true}) public collapsedHeight?: number;

  @State() public isExpanded = true;

  @State() public showButton = true;

  @State() private fullHeight?: number;

  private shouldRenderButton = !!this.maximumHeight;

  private validateProps() {
    if (
      this.maximumHeight &&
      (!this.collapsedHeight || this.maximumHeight < this.collapsedHeight)
    ) {
      throw new Error(
        'snippetMaximumHeight must be equal or greater than snippetCollapsedHeight'
      );
    }
  }

  public initialize() {
    this.validateProps();
  }

  public componentDidRender() {
    if (this.fullHeight === undefined && this.shouldRenderButton) {
      this.initializeFullHeight();
    }
  }

  private initializeFullHeight() {
    this.fullHeight = this.host.getBoundingClientRect().height;
    this.showButton = this.fullHeight! > this.maximumHeight!;
    this.isExpanded = !this.showButton;
    this.host.style.setProperty('--full-height', `${this.fullHeight}px`);
    this.host.style.setProperty('--full-height-value', `${this.fullHeight}`);
    this.host.style.setProperty(
      '--collapsed-size',
      `${this.showButton ? this.collapsedHeight : this.fullHeight}px`
    );
  }

  private renderButton() {
    if (!this.showButton) {
      return;
    }
    return (
      <button
        onClick={() => (this.isExpanded = !this.isExpanded)}
        class="text-primary hover:underline mb-4"
        part={this.isExpanded ? 'show-less-button' : 'show-more-button'}
      >
        {this.bindings.i18n.t(this.isExpanded ? 'show-less' : 'show-more')}
        <atomic-icon
          icon={ArrowDown}
          class="w-3 ml-2 align-baseline"
        ></atomic-icon>
      </button>
    );
  }

  render() {
    return (
      <Host
        class={
          this.fullHeight || !this.shouldRenderButton
            ? this.isExpanded
              ? 'expanded'
              : ''
            : 'invisible'
        }
      >
        <div
          part="smart-snippet-collapse-wrapper"
          class="block overflow-hidden"
        >
          <slot></slot>
        </div>
        {this.shouldRenderButton && this.renderButton()}
      </Host>
    );
  }
}
