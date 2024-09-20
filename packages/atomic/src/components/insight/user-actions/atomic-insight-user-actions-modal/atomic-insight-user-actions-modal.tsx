import {Component, h, State, Prop, Element, Watch, Host} from '@stencil/core';
import CloseIcon from '../../../../images/close.svg';
import {rectEquals} from '../../../../utils/dom-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

const exportparts =
  'container,header,header-wrapper,header-ruler,body,body-wrapper,footer,footer-wrapper,footer-wrapper';

/**
 * @internal
 * The `atomic-insight-user-actions-modal` is automatically created as a child of the `atomic-insight-interface` when the `atomic-insight-user-actions-toggle` is initialized.
 *
 * When the modal is opened, the CSS class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 */
@Component({
  tag: 'atomic-insight-user-actions-modal',
  styleUrl: 'atomic-insight-user-actions-modal.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsModal
  implements InitializableComponent<InsightBindings>
{
  @Element() public host!: HTMLElement;
  @InitializeBindings() public bindings!: InsightBindings;
  @State()
  public error!: Error;
  @State()
  public interfaceDimensions?: DOMRect;

  @Prop({mutable: true}) openButton?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  /**
   * The ID of the user whose actions are being displayed.
   */
  @Prop() public userId!: string;
  /**
   * The date and time when the case was created. For example "2024-01-01T00:00:00Z"
   */
  @Prop() public ticketCreationDateTime!: string;

  public componentDidLoad() {
    this.host.style.display = '';
  }

  @Watch('isOpen')
  watchEnabled(isOpen: boolean) {
    if (isOpen) {
      this.onAnimationFrame();
    }
  }

  private onAnimationFrame() {
    if (!this.isOpen) {
      return;
    }
    if (this.dimensionChanged()) {
      this.updateDimensions();
    }
    window.requestAnimationFrame(() => this.onAnimationFrame());
  }

  private dimensionChanged() {
    if (!this.interfaceDimensions) {
      return true;
    }

    return !rectEquals(
      this.interfaceDimensions,
      this.bindings.interfaceElement.getBoundingClientRect()
    );
  }

  public updateDimensions() {
    this.interfaceDimensions =
      this.bindings.interfaceElement.getBoundingClientRect();
  }

  public render() {
    const renderHeader = () => {
      return (
        <div slot="header" class="contents">
          <div part="title" class="truncate font-light">
            {this.bindings.i18n.t('user-actions')}
          </div>
          <Button
            style="text-transparent"
            class="grid place-items-center"
            part="close-button"
            onClick={() => (this.isOpen = false)}
            ariaLabel={this.bindings.i18n.t('close')}
          >
            <atomic-icon
              part="close-icon"
              class="h-5 w-5"
              icon={CloseIcon}
            ></atomic-icon>
          </Button>
        </div>
      );
    };

    const renderBody = () => {
      return (
        <aside
          style={{height: '100%'}}
          slot="body"
          class="adjust-for-scroll-bar flex w-full flex-col px-2"
        >
          <atomic-insight-user-actions-timeline
            userId={this.userId}
            ticketCreationDateTime={this.ticketCreationDateTime}
            class="flex-1"
          ></atomic-insight-user-actions-timeline>
        </aside>
      );
    };
    return (
      <Host>
        {this.interfaceDimensions && (
          <style>
            {`atomic-modal::part(backdrop) {
            top: ${this.interfaceDimensions.top}px;
            left: ${this.interfaceDimensions.left}px;
            width: ${this.interfaceDimensions.width}px;
            height: ${this.interfaceDimensions.height}px;
            }`}
          </style>
        )}
        <atomic-modal
          fullscreen
          isOpen={this.isOpen}
          source={this.openButton}
          container={this.host}
          close={() => (this.isOpen = false)}
          exportparts={exportparts}
          scope={this.bindings.interfaceElement}
        >
          {renderHeader()}
          {renderBody()}
        </atomic-modal>
      </Host>
    );
  }
}
