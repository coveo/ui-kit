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
import {updateBreakpoints} from '../../../utils/replace-breakpoint-utils';
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

  @Watch('isOpen')
  async watchToggleOpen(isOpen: boolean) {
    const modalOpenedClass = 'atomic-ipx-modal-opened';

    if (isOpen) {
      document.body.classList.add(modalOpenedClass);
      this.bindings.interfaceElement.classList.add(modalOpenedClass);
      return;
    }
    document.body.classList.remove(modalOpenedClass);
    this.bindings.interfaceElement.classList.remove(modalOpenedClass);
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
        exportparts="container"
      >
        <slot name="header" slot="header" />
        <slot name="body" slot="body" />
        <slot name="footer" slot="footer" />
      </atomic-ipx-body>
    );

    return (
      <Host class={this.getClasses().join(' ')} part="atomic-ipx-modal">
        <div part="backdrop">
          <Body />
        </div>
      </Host>
    );
  }
}
