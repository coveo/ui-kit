import {
  createPopperLite as createPopper,
  preventOverflow,
  Instance as PopperInstance,
} from '@popperjs/core';
import {
  Component,
  h,
  Listen,
  State,
  Element,
  Host,
  Method,
} from '@stencil/core';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';
import {Button} from '../button';

/**
 * @internal
 */
@Component({
  tag: 'tab-popover',
  shadow: true,
  styleUrl: 'tab-popover.pcss',
})
export class TabPopover implements InitializableComponent {
  @Element() private host!: HTMLElement;

  @InitializeBindings() public bindings!: Bindings;

  @State()
  public show = false;

  @State()
  public error!: Error;

  @State()
  private isOpen = false;

  private buttonRef!: HTMLElement;
  private popupRef!: HTMLElement;
  private popperInstance?: PopperInstance;
  public popoverId = 'tab-popover';

  public initialize() {}

  private initializePopover() {
    this.popupRef.classList.add('popover-nested');
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

  get hasTabs() {
    return !!this.popupRef.children.length;
  }

  @Method()
  public async togglePopover() {
    this.isOpen = !this.isOpen;
  }

  @Method()
  public async setButtonVisibility(isVisible: boolean) {
    this.show = isVisible;
  }

  @Method()
  public async closePopoverOnFocusOut(event: FocusEvent) {
    const slot = this.popupRef.children[0] as HTMLSlotElement;
    const assignedElements = slot.assignedElements() as HTMLElement[];

    const isMovingToSlottedElement = assignedElements.some(
      (element) =>
        element === event.relatedTarget ||
        element.contains(event.relatedTarget as Node)
    );

    if (isMovingToSlottedElement) {
      return;
    }

    if (!this.popupRef.contains(event.relatedTarget as Node)) {
      this.closePopover();
    }
  }

  private closePopover() {
    this.isOpen = false;
  }

  private renderDropdownButton() {
    const label = this.bindings?.i18n.t('more');
    const ariaLabel = this.bindings?.i18n.t('tab-popover', {label});
    const buttonClasses = [
      'relative',
      'pb-1',
      'mt-1',
      'group',
      'mr-6',
      'font-semibold',
    ];

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
            'group-hover:text-primary-light group-focus:text-primary mr-1.5 truncate'
          }
        >
          {label}
        </span>
        <atomic-icon
          part="arrow-icon"
          class={`group-hover:text-primary-light group-focus:text-primary ml-auto w-2 ${
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
        class="fixed bottom-0 left-0 right-0 top-0 z-[9998] cursor-pointer bg-transparent"
        onClick={() => this.togglePopover()}
      ></div>
    );
  }

  private renderPopover() {
    return (
      <div class={`relative ${this.isOpen ? 'z-[9999]' : ''}`}>
        {this.renderDropdownButton()}
        <ul
          id={this.popoverId}
          ref={(el) => (this.popupRef = el!)}
          part="overflow-tabs"
          class={`bg-background border-neutral absolute rounded-lg border py-2 shadow-lg ${
            this.isOpen ? 'flex' : 'hidden'
          }`}
        >
          <slot></slot>
        </ul>
      </div>
    );
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

  public render() {
    return (
      <Host
        onFocusout={(event: FocusEvent) => this.closePopoverOnFocusOut(event)}
        class={this.show ? '' : 'visibility-hidden'}
        aria-hidden={!this.show}
      >
        {this.renderPopover()}
        {this.isOpen && this.renderBackdrop()}
      </Host>
    );
  }
}
