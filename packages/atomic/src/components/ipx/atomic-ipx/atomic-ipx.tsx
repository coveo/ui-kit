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
import {IPXVariants} from '../ipx-variants';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx',
  styleUrl: 'atomic-ipx.pcss',
  shadow: true,
})
export class AtomicIPX implements InitializableComponent<AnyBindings> {
  @InitializeBindings() public bindings!: AnyBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;

  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @Prop({mutable: true}) container?: HTMLElement;
  @Prop({reflect: true}) variant: IPXVariants = IPXVariants.Modal;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  @Event() animationEnded!: EventEmitter<never>;

  @State() private hasFooterSlotElements = true;

  private readonly isEmbedded = this.variant === IPXVariants.Embedded;

  @Watch('isOpen')
  async watchToggleOpen(isOpen: boolean) {
    if (this.variant === IPXVariants.Embedded) {
      return;
    }
    const modalOpenedClass = 'atomic-ipx-modal-opened';

    if (isOpen) {
      //TODO: remove the addition of a class to the body in atomicV3
      document.body.classList.add(modalOpenedClass);
      this.bindings.interfaceElement.classList.add(modalOpenedClass);
      return;
    }
    //TODO: remove the removal of a class to the body in atomicV3
    document.body.classList.remove(modalOpenedClass);
    this.bindings.interfaceElement.classList.remove(modalOpenedClass);
  }

  private getClasses() {
    const classes: string[] = [];
    if (this.isEmbedded) {
      classes.push('embedded');
      return classes;
    }
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
        isEmbedded={this.isEmbedded}
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
          <Body />
        </div>
      </Host>
    );
  }
}
