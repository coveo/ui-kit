import {
  NotifyTrigger,
  NotifyTriggerState,
  buildNotifyTrigger,
} from '@coveo/headless';
import {Component, h, State, Fragment, Prop} from '@stencil/core';
import InfoIcon from '../../../images/info.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {Heading} from '../../common/stencil-heading';
import {Hidden} from '../../common/stencil-hidden';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-notifications` component is responsible for displaying notifications generated by the Coveo Search API (see [Trigger](https://docs.coveo.com/en/1458)).
 *
 * @part notifications - The wrapper around the notifications.
 * @part notification - The wrapper around a single notification.
 * @part icon - The icon of the notification.
 * @part text - The text of the notification.
 */
@Component({
  tag: 'atomic-notifications',
  styleUrl: 'atomic-notifications.pcss',
  shadow: true,
})
export class AtomicNotifications implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  protected notifyTrigger!: NotifyTrigger;

  @BindStateToController('notifyTrigger')
  @State()
  private notifyTriggerState?: NotifyTriggerState;
  @State() public error!: Error;

  @AriaLiveRegion('notifications') ariaMessage!: string;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use above the notifications, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;

  /**
   * Specifies an icon to display at the left-end of a notification.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly
   */
  @Prop({reflect: true}) public icon?: string;

  public initialize() {
    this.notifyTrigger = buildNotifyTrigger(this.bindings.engine);
  }

  public generateAriaMessage() {
    if (this.notifications.length === 1) {
      return this.notifications[0];
    }
    return this.notifications
      .map((text, i) =>
        this.bindings.i18n.t('notification-n', {n: i + 1, text})
      )
      .join('\n');
  }

  public renderNotification(text: string) {
    return (
      <div
        part="notification"
        class="bg-background border-neutral-dark flex items-center rounded-md border p-6 shadow-lg"
      >
        <atomic-icon
          icon={this.icon ?? InfoIcon}
          part="icon"
          class="text-neutral-dark mr-6 h-7 w-7"
        />
        <span part="text" class="text-on-background text-base leading-5">
          {text}
        </span>
      </div>
    );
  }

  public renderNotifications() {
    return (
      <div part="notifications" class="flex flex-col gap-4">
        {this.notifications.map((text) => this.renderNotification(text))}
      </div>
    );
  }

  public render() {
    if (!this.notifications.length) {
      return <Hidden></Hidden>;
    }

    this.ariaMessage = this.generateAriaMessage();

    return (
      <Fragment>
        <Heading level={this.headingLevel ?? 0} class="sr-only">
          {this.bindings.i18n.t('notifications')}
        </Heading>
        {this.renderNotifications()}
      </Fragment>
    );
  }

  private get notifications(): string[] {
    return this.notifyTriggerState?.notifications || [];
  }
}
