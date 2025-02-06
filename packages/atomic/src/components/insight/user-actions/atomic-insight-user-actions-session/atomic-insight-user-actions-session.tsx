import {UserAction as IUserAction} from '@coveo/headless/insight';
import {Component, h, Prop, Watch, State} from '@stencil/core';
import Flag from '../../../../images/flag.svg';
import ThreeDotsIcon from '../../../../images/three-dots.svg';
import {parseTimestampToDateDetails} from '../../../../utils/date-utils';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/stencil-button';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';
import {UserAction} from './user-action';

export type UserActionType =
  | 'SEARCH'
  | 'CLICK'
  | 'TICKET_CREATION'
  | 'VIEW'
  | 'CUSTOM';

/**
 * @internal
 * The `AtomicInsightUserActionSession` component displays all the user actions that took place during a specific user session.
 * @category Insight Panel
 * @example
 * <atomic-insight-user-actions-session userActions={actions} startTimestamp={1723035731}></atomic-insight-user-actions-session>
 */
@Component({
  tag: 'atomic-insight-user-actions-session',
  styleUrl: 'atomic-insight-user-actions-session.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsSession {
  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  /**
   * The start time of the session as a Unix timestamp.
   */
  @Prop() public startTimestamp!: number;
  /**
   * The list of user actions performed during the session.
   */
  @Prop() public userActions!: Array<IUserAction>;

  private userActionsToDisplay: Array<IUserAction> = [];
  private userActionsAfterCaseCreation: Array<IUserAction> = [];
  @State() areActionsAfterCaseCreationVisible = false;

  connectedCallback() {
    this.prepareUserActionsToDisplay();
  }

  @Watch('userActions')
  prepareUserActionsToDisplay() {
    const caseCreationIndex = this.userActions.findIndex(
      ({actionType}) => actionType === 'TICKET_CREATION'
    );
    const isCaseCreationSession = caseCreationIndex !== -1;

    if (!isCaseCreationSession) {
      this.userActionsToDisplay = this.userActions;
      this.userActionsAfterCaseCreation = [];
    } else {
      this.userActionsToDisplay = this.userActions.slice(caseCreationIndex);
      this.userActionsAfterCaseCreation = this.userActions.slice(
        0,
        caseCreationIndex
      );
    }
  }

  showActionsAfterCaseCreation() {
    this.areActionsAfterCaseCreationVisible = true;
  }

  renderSessionStartDate() {
    const caseCreationIndex = this.userActions.findIndex(
      ({actionType}) => actionType === 'TICKET_CREATION'
    );
    const isCaseCreationSession = caseCreationIndex !== -1;

    const {year, month, dayOfWeek, day} = parseTimestampToDateDetails(
      this.startTimestamp
    );

    const formatedStartDate = `${dayOfWeek}. ${month} ${day}, ${year}`;
    return (
      <div class="flex items-center px-2 pb-3">
        {isCaseCreationSession ? (
          <div class="session-start-icon__container mr-2 flex h-5 w-5 items-center justify-center rounded-full">
            <atomic-icon icon={Flag} class="h-3 w-3"></atomic-icon>
          </div>
        ) : null}

        <div class="flex-1 font-semibold">{formatedStartDate}</div>
      </div>
    );
  }

  renderActions(actions: Array<IUserAction>) {
    return (
      <ol class="px-3">
        {actions?.map((action) => (
          <UserAction action={action} bindings={this.bindings}></UserAction>
        ))}
      </ol>
    );
  }

  renderShowMoreActionsButton() {
    const btnClasses = 'flex items-center p-1 max-w-full';
    const label = this.bindings.i18n.t('more-actions-in-session', {
      count: this.userActionsAfterCaseCreation.length,
    });
    return (
      <div
        data-testid="show-more-actions-button"
        class="flex items-center px-3 pb-3"
      >
        <div class="flex justify-center pr-2">
          <atomic-icon icon={ThreeDotsIcon} class="h-3 w-3"></atomic-icon>
        </div>
        <div class="flex-1">
          <Button
            style="text-primary"
            part="show-more-actions-button"
            class={btnClasses}
            ariaLabel={label}
            onClick={this.showActionsAfterCaseCreation.bind(this)}
          >
            <span class="truncate text-xs font-light">{label}</span>
          </Button>
        </div>
      </div>
    );
  }

  public render() {
    const isShowMoreActionsButtonVisible =
      !this.areActionsAfterCaseCreationVisible &&
      !!this.userActionsAfterCaseCreation.length;

    return (
      <div>
        {this.renderSessionStartDate()}

        {this.areActionsAfterCaseCreationVisible && (
          <div data-testid="more-actions-section">
            {this.renderActions(this.userActionsAfterCaseCreation)}
          </div>
        )}

        {isShowMoreActionsButtonVisible && this.renderShowMoreActionsButton()}

        {this.renderActions(this.userActionsToDisplay)}
      </div>
    );
  }
}
