import {Component, h, Prop, Watch, State} from '@stencil/core';
import New from '../../../../images/new.svg';
import ThreeDotsIcon from '../../../../images/three-dots.svg';
import {parseTimestampToDateDetails} from '../../../../utils/date-utils';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

export type UserActionType =
  | 'SEARCH'
  | 'CLICK'
  | 'TICKET_CREATION'
  | 'VIEW'
  | 'CUSTOM';

type UserActions = Array<{
  type: UserActionType;
  origin: string;
  timestamp: number;
  actionTitle: string;
}>;

/**
 * @internal
 * The `AtomicInsightUserActionSession` component displays all the user actions that took place during a specific user session.
 * @category Insight Panel
 * @example
 * <atomic-insight-user-actions-session userActions={actions} startDate="1723035731"></atomic-insight-user-actions-session>
 */
@Component({
  tag: 'atomic-insight-user-actions-session',
  styleUrl: 'atomic-insight-user-actions-session.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsSession {
  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  @Prop({mutable: true}) public startDate!: number;
  @Prop({mutable: true}) public userActions: UserActions = [];

  private caseCreationIndex = -1;
  private userActionsToDisplay: UserActions = [];
  private userActionsAfterCaseCreation: UserActions = [];
  private showMoreActionsButtonShouldBeVisible = false;
  @State() actionsAfterCaseCreationShouldBeVisible = false;

  connectedCallback() {
    this.setUserActionsToDisplay();
    this.extractUserActionsAfterCaseCreation();
  }

  setCaseCreationIndex() {
    this.caseCreationIndex = this.userActions.findIndex(
      (action) => action.type === 'TICKET_CREATION'
    );
  }

  @Watch('userActions')
  setUserActionsToDisplay() {
    this.setCaseCreationIndex();

    if (this.caseCreationIndex === -1) {
      this.userActionsToDisplay = this.userActions;
    } else {
      this.userActionsToDisplay = this.userActions.slice(
        this.caseCreationIndex,
        this.userActions.length
      );
    }
  }

  @Watch('userActions')
  extractUserActionsAfterCaseCreation() {
    this.setCaseCreationIndex();

    if (this.caseCreationIndex === -1) {
      this.userActionsAfterCaseCreation = [];
    } else {
      this.userActionsAfterCaseCreation = this.userActions.slice(
        0,
        this.caseCreationIndex
      );
    }
  }

  showActionsAfterCaseCreation() {
    this.actionsAfterCaseCreationShouldBeVisible = true;
  }

  renderSessionStartDate() {
    const {year, month, dayOfWeek, day} = parseTimestampToDateDetails(
      this.startDate
    );

    const formatedStartDate = `${dayOfWeek}. ${month} ${day}, ${year}`;
    return (
      <div class="flex items-center px-2 pb-3">
        <div
          class="flex-one mr-2 flex h-5 w-5 items-center justify-center rounded-full"
          style={{backgroundColor: 'orange'}}
        >
          <atomic-icon
            icon={New}
            class="h-3 w-3"
            style={{color: 'white'}}
          ></atomic-icon>
        </div>

        <div class="flex-1 font-semibold">{formatedStartDate}</div>
      </div>
    );
  }

  renderActions(actions: UserActions) {
    return (
      <ol class="px-3">
        {actions?.map(({actionTitle, origin, type, timestamp}) => (
          <atomic-insight-user-action
            actionTitle={actionTitle}
            origin={origin}
            type={type}
            timestamp={timestamp}
          ></atomic-insight-user-action>
        ))}
      </ol>
    );
  }

  renderShowMoreActionsButton() {
    return (
      <div class="px-3 pb-3">
        <div class="flex">
          <div class="flex-none pr-2">
            <div class="flex justify-center py-1">
              <atomic-icon icon={ThreeDotsIcon} class="h-3 w-3"></atomic-icon>
            </div>
          </div>
          <div class="flex-1">
            <button
              onClick={this.showActionsAfterCaseCreation.bind(this)}
              class="btn-text-primary flex items-center"
            >
              {this.bindings.i18n.t('more-actions-in-session', {
                count: this.userActionsAfterCaseCreation.length,
              })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  public render() {
    this.showMoreActionsButtonShouldBeVisible =
      !this.actionsAfterCaseCreationShouldBeVisible &&
      !!this.userActionsAfterCaseCreation.length;

    return (
      <div>
        {this.renderSessionStartDate()}

        {this.actionsAfterCaseCreationShouldBeVisible &&
          this.renderActions(this.userActionsAfterCaseCreation)}

        {this.showMoreActionsButtonShouldBeVisible &&
          this.renderShowMoreActionsButton()}

        {this.renderActions(this.userActionsToDisplay)}
      </div>
    );
  }
}
