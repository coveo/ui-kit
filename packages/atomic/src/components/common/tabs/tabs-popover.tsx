import {
  createPopperLite as createPopper,
  preventOverflow,
  Instance as PopperInstance,
} from '@popperjs/core';
import {Component, h, Listen, State, Element, Host, Prop} from '@stencil/core';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import {Button} from '../button';
import {AnyBindings} from '../interface/bindings';
import {tabsPopoverClass} from './tabs-popover-type';

/**
 * @internal
 */
@Component({
  tag: 'tabs-popover',
  shadow: true,
  styleUrl: 'tabs-popover.pcss',
})
export class TabsPopover {
  @Element() private host!: HTMLElement;
  private buttonRef!: HTMLElement;
  private popupRef!: HTMLElement;
  private popperInstance?: PopperInstance;
  private popoverId = 'tabs-popover';

  @Prop() public bindings: AnyBindings | undefined;

  @State()
  public error!: Error;
  @State() private isOpen = false;

  public initialize() {
    if (this.host.children.length === 0) {
      this.error = new Error(
        'One child is required inside a set of popover tags.'
      );

      return;
    }

    if (this.host.children.length > 1) {
      this.error = new Error(
        'Cannot have more than one child inside a set of popover tags.'
      );
    }
  }

  public initializePopover() {
    this.popupRef.classList.add(tabsPopoverClass);
  }

  @Listen('keydown')
  public handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.isOpen) {
      this.togglePopover();
    }
  }

  get slotElements() {
    return this.host.children;
  }

  private togglePopover() {
    this.isOpen = !this.isOpen;
  }

  public componentDidRender() {
    if (this.popperInstance || !this.buttonRef || !this.popupRef) {
      return;
    }

    this.popperInstance = createPopper(this.buttonRef, this.popupRef, {
      placement: 'bottom-end',
      modifiers: [preventOverflow],
    });
    this.initializePopover();
  }

  public componentDidUpdate() {
    this.popperInstance?.forceUpdate();
  }

  private renderDropdownButton() {
    const label = this.bindings?.i18n.t('more');
    const ariaLabel = this.bindings?.i18n.t('popover', {label});
    const buttonClasses = ['relative', 'pb-1', 'mt-1', 'mr-6', 'font-semibold'];

    return (
      <Button
        ref={(el) => (this.buttonRef = el!)}
        style="text-transparent"
        onClick={() => this.togglePopover()}
        part="popover-button"
        ariaExpanded={`${this.isOpen}`}
        ariaLabel={ariaLabel}
        ariaControls={this.popoverId}
        class={`${buttonClasses.join(' ')}`}
      >
        <span
          title={label}
          part="value-label"
          class={
            'truncate mr-1.5 group-hover:text-primary-light group-focus:text-primary'
          }
        >
          {label}
        </span>
        <atomic-icon
          part="arrow-icon"
          class={`w-2 ml-auto group-hover:text-primary-light group-focus:text-primary ${
            this.isOpen ? 'rotate-180' : ''
          }`}
          icon={ArrowBottomIcon}
        ></atomic-icon>
      </Button>
    );
  }

  private renderBackdrop() {
    return (
      <div
        part="backdrop"
        class="fixed left-0 top-0 right-0 bottom-0 z-[9998] bg-transparent cursor-pointer"
        onClick={() => this.togglePopover()}
      ></div>
    );
  }

  private renderPopover() {
    return (
      <div class={`relative ${this.isOpen ? 'z-[9999]' : ''}`}>
        {this.renderDropdownButton()}
        <div
          id={this.popoverId}
          ref={(el) => (this.popupRef = el!)}
          part="overflow-tabs"
          class={`absolute py-1 bg-background border-neutral border rounded-lg shadow-lg ${
            this.isOpen ? 'flex' : 'hidden'
          }`}
        >
          <slot></slot>
        </div>
      </div>
    );
  }

  public render() {
    return (
      <Host>
        <atomic-focus-trap
          source={this.buttonRef}
          container={this.popupRef}
          active={this.isOpen}
          shouldHideSelf={false}
          scope={this.bindings?.interfaceElement}
        >
          {this.renderPopover()}
        </atomic-focus-trap>
        {this.isOpen && this.renderBackdrop()}
      </Host>
    );
  }
}
