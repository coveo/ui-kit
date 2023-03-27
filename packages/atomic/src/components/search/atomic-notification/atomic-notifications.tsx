import {
  NotifyTrigger,
  NotifyTriggerState,
  buildNotifyTrigger,
} from '@coveo/headless';
import {Component, h, State, Fragment, Prop} from '@stencil/core';
import InfoIcon from '../../../images/info.svg';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Heading} from '../../common/heading';
import {Hidden} from '../../common/hidden';
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
export class AtomicNotifyTrigger implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  protected notifyTrigger!: NotifyTrigger;

  @BindStateToController('notifyTrigger')
  @State()
  private notifyTriggerState!: NotifyTriggerState;
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

  public generateAriaMessage(notifications: string[]) {
    if (notifications.length === 1) {
      return notifications[0];
    }
    return notifications
      .map((text, i) =>
        this.bindings.i18n.t('notification-n', {n: i + 1, text})
      )
      .join('\n');
  }

  public renderNotification(text: string) {
    return (
      <div
        part="notification"
        class="shadow-lg bg-background border border-neutral-dark rounded-md p-6 flex items-center"
      >
        <atomic-icon
          icon={this.icon ?? InfoIcon}
          part="icon"
          class="w-7 h-7 mr-6 text-neutral-dark"
        />
        <span part="text" class="leading-5 text-base text-on-background">
          {text}
        </span>
      </div>
    );
  }

  public renderNotifications(notifications: string[]) {
    return (
      <div part="notifications" class="flex flex-col gap-4">
        {notifications.map((text) => this.renderNotification(text))}
      </div>
    );
  }

  public render() {
    const {notifications} = this.notifyTriggerState;
    if (!notifications.length) {
      return <Hidden></Hidden>;
    }

    this.ariaMessage = this.generateAriaMessage(notifications);

    return (
      <Fragment>
        <Heading level={this.headingLevel ?? 0} class="accessibility-only">
          {this.bindings.i18n.t('notifications')}
        </Heading>
        {this.renderNotifications(notifications)}
      </Fragment>
    );
  }
}
