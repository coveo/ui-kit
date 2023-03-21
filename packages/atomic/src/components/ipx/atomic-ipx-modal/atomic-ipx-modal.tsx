import {
  Component,
  h,
  State,
  Prop,
  Element,
  Watch,
  Event,
  EventEmitter,
  Host,
  Listen,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {once, randomID} from '../../../utils/utils';
import {AnyBindings} from '../../common/interface/bindings';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-modal',
  styleUrl: 'atomic-ipx-modal.pcss',
  shadow: true,
})
export class AtomicIPXModal implements InitializableComponent<AnyBindings> {
  @InitializeBindings() public bindings!: AnyBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;

  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @Prop({mutable: true}) container?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  @Event() animationEnded!: EventEmitter<never>;

  @State() private hasFooterSlotElements = true;

  private focusTrap?: HTMLAtomicFocusTrapElement;
  private currentWatchToggleOpenExecution = 0;

  @Watch('isOpen')
  async watchToggleOpen(isOpen: boolean) {
    const watchToggleOpenExecution = ++this.currentWatchToggleOpenExecution;
    const modalOpenedClass = 'atomic-ipx-modal-opened';

    if (isOpen) {
      document.body.classList.add(modalOpenedClass);
      if (watchToggleOpenExecution === this.currentWatchToggleOpenExecution) {
        this.focusTrap!.active = true;
      }
      return;
    }
    document.body.classList.remove(modalOpenedClass);
    if (watchToggleOpenExecution === this.currentWatchToggleOpenExecution) {
      this.focusTrap!.active = false;
    }
  }

  private getClasses() {
    const classes: string[] = [];
    if (this.isOpen) {
      classes.push('open');
    }

    classes.push('dialog');

    return classes;
  }

  @Listen('touchmove', {passive: false})
  onWindowTouchMove(e: Event) {
    this.isOpen && e.preventDefault();
  }

  public componentWillLoad(): void | Promise<void> {
    this.hasFooterSlotElements = !!this.host.querySelector('[slot="footer"]');
  }

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-ipx-modal-');
    this.host.id = id;
    this.watchToggleOpen(this.isOpen);
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    const Body = () => (
      <atomic-ipx-body
        isOpen={this.isOpen}
        displayFooterSlot={this.hasFooterSlotElements}
      >
        <slot name="header" slot="header" />
        <slot name="body" slot="body" />
        <slot name="footer" slot="footer" />
      </atomic-ipx-body>
    );

    return (
      <Host class={this.getClasses().join(' ')} part="atomic-ipx-modal">
        <div part="backdrop">
          <atomic-focus-trap
            role="dialog"
            aria-modal={this.isOpen.toString()}
            source={this.source}
            container={this.container ?? this.host}
            ref={(ref) => (this.focusTrap = ref)}
            scope={this.host}
          >
            <Body />
          </atomic-focus-trap>
        </div>
      </Host>
    );
  }
}
