import {css, html, LitElement, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {when} from 'lit/directives/when.js';
import {isType} from '@coveo/commerce-agent-chat-core/lib/commerceHelpers';
import {extractProductsBySurface} from '@coveo/commerce-agent-chat-core/lib/commerceExtractor';
import {renderMarkdown} from '@coveo/commerce-agent-chat-core/lib/markdown';
import type {
  ActivityMessage,
  Message,
  ProgressTraceEntry,
} from '@coveo/commerce-agent-chat-core/types/agent';
import type {
  A2UISurfaceContent,
  Product,
} from '@coveo/commerce-agent-chat-core/types/commerce';
import './cac-activity-renderer.js';
import './cac-progress-trace.js';

interface ProgressSnapshot {
  progressSteps: string[];
  progressTrace: ProgressTraceEntry[];
}

interface ProgressSegmentStart {
  stepStart: number;
  traceStart: number;
}

type MessageChangeFlags = {
  hasMessagesChange: boolean;
  hasProgressChange: boolean;
  hasProgressTraceChange: boolean;
  hasLoadingChange: boolean;
};

/**
 * The `cac-message-list` component renders conversation messages and activities.
 */
@customElement('cac-message-list')
export class CacMessageList extends LitElement {
  private static readonly bottomThresholdPx = 12;

  static override styles = css`
    :host {
      display: flex;
      width: 100%;
      min-width: 0;
      min-height: 0;
      flex: 1;
    }

    .message-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 1rem 1.25rem;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: #b8c2d1 #eef2f7;
    }

    .message-list > cac-activity-renderer {
      display: block;
      width: 100%;
    }

    .message-list::-webkit-scrollbar {
      width: 10px;
    }

    .message-list::-webkit-scrollbar-track {
      background: #eef2f7;
      border-radius: 999px;
      border: 1px solid #d6dce6;
    }

    .message-list::-webkit-scrollbar-thumb {
      background: #b8c2d1;
      border-radius: 999px;
      border: 1px solid #a9b5c7;
    }

    .message-list::-webkit-scrollbar-thumb:hover {
      background: #98a7bd;
    }

    .message {
      width: fit-content;
      max-width: min(80ch, 88%);
      padding: 0.9rem 1.1rem;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: #fff;
      overflow-wrap: anywhere;
      text-align: left;
    }

    .message-user {
      align-self: flex-end;
      background: #edf4ff;
      border-color: #c8dcff;
    }

    .message-content {
      margin: 0;
      line-height: 1.5;
      text-align: left;
    }

    .message-content--plain {
      white-space: pre-line;
    }

    cac-progress-trace {
      width: 100%;
    }

    .empty-state {
      flex: 1;
      display: grid;
      place-items: center;
      margin: 0;
      text-align: center;
      color: var(--ink-muted);
    }

    @media (max-width: 720px) {
      .message {
        max-width: 94%;
      }
    }
  `;

  /** The chat messages to render. */
  @property({attribute: false})
  public messages: Message[] = [];

  /** Whether the assistant is currently streaming a response. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  /** The in-progress status steps for the latest assistant response. */
  @property({attribute: false})
  public progressSteps: string[] = [];

  /** The structured in-progress trace for reasoning and tool calls. */
  @property({attribute: false})
  public progressTrace: ProgressTraceEntry[] = [];

  private wasAtBottomBeforeUpdate = true;
  private shouldAutoScroll = true;
  private hasRenderedSkeletonInCurrentTurn = false;

  @state()
  private currentTraceSegmentStarts: ProgressSegmentStart[] = [
    {stepStart: 0, traceStart: 0},
  ];

  @state()
  private progressHistoryByMessageId: Record<string, ProgressSnapshot[]> = {};

  override disconnectedCallback() {
    this.getMessageList()?.removeEventListener(
      'scroll',
      this.handleMessageListScroll
    );
    super.disconnectedCallback();
  }

  override firstUpdated() {
    const messageList = this.getMessageList();

    if (!messageList) {
      return;
    }

    this.shouldAutoScroll = this.isScrolledToBottom(messageList);
    messageList.addEventListener('scroll', this.handleMessageListScroll, {
      passive: true,
    });
  }

  override willUpdate(changedProperties: PropertyValues<this>) {
    if (!this.hasRelevantMessageListChanges(changedProperties)) {
      return;
    }

    this.captureScrollPositionBeforeUpdate();

    const previousIsLoading = this.getPreviousIsLoading(changedProperties);

    if (this.isLoading && !previousIsLoading) {
      this.resetCurrentTraceSegmentStarts();
      return;
    }

    if (!this.isLoading || !changedProperties.has('messages')) {
      return;
    }

    const previousMessages =
      (changedProperties.get('messages') as Message[] | undefined) ?? [];
    const newAssistantActivities = this.getNewAssistantActivities(
      previousMessages,
      this.messages
    );
    const skeletonLikelyActivityCount = newAssistantActivities.filter(
      (activity) => this.activityLikelyRendersSkeleton(activity)
    ).length;

    if (skeletonLikelyActivityCount === 0) {
      return;
    }

    this.hasRenderedSkeletonInCurrentTurn = true;

    for (let i = 0; i < skeletonLikelyActivityCount; i++) {
      this.pushCurrentTraceSegmentStart();
    }
  }

  override render() {
    const lastAssistantId = this.getLastAssistantId();

    return html`
      <section
        class="message-list"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        ${when(
          this.messages.length === 0,
          () =>
            html`<p class="empty-state">
              Start a conversation with the commerce agent
            </p>`
        )}
        ${this.renderMessages(lastAssistantId)}
      </section>
    `;
  }

  override updated(changedProperties: PropertyValues<this>) {
    const {
      hasMessagesChange,
      hasProgressChange,
      hasProgressTraceChange,
      hasLoadingChange,
    } = this.getMessageChangeFlags(changedProperties);

    if (
      !hasMessagesChange &&
      !hasProgressChange &&
      !hasProgressTraceChange &&
      !hasLoadingChange
    ) {
      return;
    }

    const previousMessages = hasMessagesChange
      ? ((changedProperties.get('messages') as Message[] | undefined) ?? [])
      : undefined;

    if (this.handlePromptSubmission(hasMessagesChange, previousMessages)) {
      return;
    }

    const wasLoading = this.getPreviousIsLoading(changedProperties);

    this.handleLoadingStart(wasLoading);

    if (this.handleLoadingCompletion()) {
      return;
    }

    this.pruneProgressHistoryOnMessageChange(hasMessagesChange);

    if (!this.shouldAutoScrollAfterUpdate()) {
      return;
    }

    this.deferScrollToLatestMessage();
  }

  private handlePromptSubmission(
    hasMessagesChange: boolean,
    previousMessages?: Message[]
  ) {
    const hasPromptSubmission = hasMessagesChange
      ? this.hasNewPromptSubmission(previousMessages)
      : false;

    if (!hasPromptSubmission) {
      return false;
    }

    this.deferScrollToLatestMessage();

    return true;
  }

  private handleLoadingStart(wasLoading: boolean) {
    if (!this.isLoading || wasLoading) {
      return;
    }

    this.hasRenderedSkeletonInCurrentTurn = false;
    this.resetCurrentTraceSegmentStarts();
  }

  private handleLoadingCompletion() {
    if (this.isLoading) {
      return false;
    }

    this.persistLatestAssistantProgressHistory();
    this.pruneProgressHistory();
    this.hasRenderedSkeletonInCurrentTurn = false;
    this.resetCurrentTraceSegmentStarts();

    return true;
  }

  private pruneProgressHistoryOnMessageChange(hasMessagesChange: boolean) {
    if (!hasMessagesChange) {
      return;
    }

    this.pruneProgressHistory();
  }

  private shouldAutoScrollAfterUpdate() {
    if (!this.shouldAutoScroll || !this.wasAtBottomBeforeUpdate) {
      return false;
    }

    if (this.hasRenderedSkeletonInCurrentTurn) {
      return false;
    }

    return true;
  }

  private hasNewPromptSubmission(previousMessages?: Message[]) {
    const previousCount = previousMessages?.length ?? 0;

    if (this.messages.length <= previousCount) {
      return false;
    }

    return this.messages
      .slice(previousCount)
      .some((message) => message.role === 'user');
  }

  private renderMessages(lastAssistantId?: string) {
    return map(this.messages, (message) =>
      this.renderMessage(message, lastAssistantId)
    );
  }

  private handleMessageListScroll = () => {
    const messageList = this.getMessageList();

    if (!messageList) {
      return;
    }

    this.shouldAutoScroll = this.isScrolledToBottom(messageList);
  };

  private getMessageList() {
    return this.renderRoot.querySelector<HTMLElement>('.message-list');
  }

  private getMessageChangeFlags(
    changedProperties: PropertyValues<this>
  ): MessageChangeFlags {
    return {
      hasMessagesChange: changedProperties.has('messages'),
      hasProgressChange: changedProperties.has('progressSteps'),
      hasProgressTraceChange: changedProperties.has('progressTrace'),
      hasLoadingChange: changedProperties.has('isLoading'),
    };
  }

  private hasRelevantMessageListChanges(
    changedProperties: PropertyValues<this>
  ) {
    const {
      hasMessagesChange,
      hasProgressChange,
      hasProgressTraceChange,
      hasLoadingChange,
    } = this.getMessageChangeFlags(changedProperties);

    return (
      hasMessagesChange ||
      hasProgressChange ||
      hasProgressTraceChange ||
      hasLoadingChange
    );
  }

  private getPreviousIsLoading(changedProperties: PropertyValues<this>) {
    return (
      (changedProperties.get('isLoading') as boolean | undefined) ??
      this.isLoading
    );
  }

  private captureScrollPositionBeforeUpdate() {
    const messageList = this.getMessageList();
    this.wasAtBottomBeforeUpdate = messageList
      ? this.isScrolledToBottom(messageList)
      : true;
  }

  private resetCurrentTraceSegmentStarts() {
    this.currentTraceSegmentStarts = [{stepStart: 0, traceStart: 0}];
  }

  private isScrolledToBottom(messageList: HTMLElement) {
    const distanceFromBottom =
      messageList.scrollHeight -
      messageList.scrollTop -
      messageList.clientHeight;

    return distanceFromBottom <= CacMessageList.bottomThresholdPx;
  }

  private scrollToLatestMessage() {
    const messageList = this.getMessageList();

    if (!messageList) {
      return;
    }

    messageList.scrollTo({top: messageList.scrollHeight, behavior: 'auto'});
  }

  private deferScrollToLatestMessage() {
    requestAnimationFrame(() => {
      this.scrollToLatestMessage();

      const messageList = this.getMessageList();
      if (!messageList) {
        return;
      }

      this.shouldAutoScroll = this.isScrolledToBottom(messageList);
    });
  }

  private pushCurrentTraceSegmentStart() {
    const lastStart =
      this.currentTraceSegmentStarts[this.currentTraceSegmentStarts.length - 1];
    const nextStart = {
      stepStart: this.progressSteps.length,
      traceStart: this.progressTrace.length,
    };

    if (
      lastStart &&
      lastStart.stepStart === nextStart.stepStart &&
      lastStart.traceStart === nextStart.traceStart
    ) {
      return;
    }

    this.currentTraceSegmentStarts = [
      ...this.currentTraceSegmentStarts,
      nextStart,
    ];
  }

  private getLastAssistantMessage(messages: Message[]) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];

      if (message.role === 'assistant') {
        return message;
      }
    }

    return undefined;
  }

  private getNewAssistantActivities(
    previousMessages: Message[],
    nextMessages: Message[]
  ) {
    const previousAssistant = this.getLastAssistantMessage(previousMessages);
    const nextAssistant = this.getLastAssistantMessage(nextMessages);

    if (!nextAssistant) {
      return [] as ActivityMessage[];
    }

    const nextActivities = nextAssistant.activities ?? [];

    if (!previousAssistant || previousAssistant.id !== nextAssistant.id) {
      return nextActivities;
    }

    const previousActivities = previousAssistant.activities ?? [];

    if (nextActivities.length <= previousActivities.length) {
      return [] as ActivityMessage[];
    }

    return nextActivities.slice(previousActivities.length);
  }

  private getSurfaceOperations(activity: ActivityMessage) {
    if (!activity || activity.activityType !== 'a2ui-surface') {
      return [] as NonNullable<A2UISurfaceContent['operations']>;
    }

    return (
      (activity.content as unknown as A2UISurfaceContent)?.operations ?? []
    );
  }

  private activityLikelyRendersSkeleton(activity: ActivityMessage) {
    const operations = this.getSurfaceOperations(activity);

    return operations.some((operation) =>
      (operation.surfaceUpdate?.components ?? []).some((component) => {
        const componentType = Object.keys(component.component ?? {})[0] ?? '';

        return (
          isType(componentType, 'ProductCarousel') ||
          isType(componentType, 'NextActionsBar') ||
          isType(componentType, 'ComparisonTable') ||
          isType(componentType, 'BundleDisplay')
        );
      })
    );
  }

  private renderMessage(message: Message, lastAssistantId?: string) {
    const isLatestAssistantMessage =
      message.role === 'assistant' && message.id === lastAssistantId;
    const isActiveAssistantActivity =
      this.isLoading && Boolean(isLatestAssistantMessage);
    const allActivities = message.activities ?? [];
    const activeActivityId = isActiveAssistantActivity
      ? allActivities[allActivities.length - 1]?.id
      : undefined;
    const progressSegments = this.getProgressSegmentsForMessage(
      message.id,
      isLatestAssistantMessage
    );
    const {leadingProgressSegments, trailingProgressSegments} =
      this.splitProgressSegments(progressSegments);

    if (message.role === 'user') {
      return this.renderUserMessage({
        message,
        allActivities,
        isActiveAssistantActivity,
        activeActivityId,
        leadingProgressSegments,
        trailingProgressSegments,
      });
    }

    return this.renderAssistantMessage({
      message,
      allActivities,
      isActiveAssistantActivity,
      activeActivityId,
      leadingProgressSegments,
      trailingProgressSegments,
    });
  }

  private splitProgressSegments(
    progressSegments: Array<ProgressSnapshot & {isStreaming: boolean}>
  ) {
    return {
      leadingProgressSegments: progressSegments.slice(0, 1),
      trailingProgressSegments: progressSegments.slice(1),
    };
  }

  private renderUserMessage({
    message,
    allActivities,
    isActiveAssistantActivity,
    activeActivityId,
    leadingProgressSegments,
    trailingProgressSegments,
  }: {
    message: Message;
    allActivities: NonNullable<Message['activities']>;
    isActiveAssistantActivity: boolean;
    activeActivityId?: string;
    leadingProgressSegments: Array<ProgressSnapshot & {isStreaming: boolean}>;
    trailingProgressSegments: Array<ProgressSnapshot & {isStreaming: boolean}>;
  }) {
    const messageTemplate = html`
      <article class=${`message message-${message.role}`}>
        ${this.renderMessageBody(message, isActiveAssistantActivity)}
      </article>
    `;

    return html`
      ${messageTemplate}
      ${this.renderProgressSegments(leadingProgressSegments, message.id)}
      ${this.renderActivities(
        allActivities,
        allActivities,
        isActiveAssistantActivity,
        activeActivityId
      )}
      ${this.renderProgressSegments(trailingProgressSegments, message.id)}
    `;
  }

  private renderAssistantMessage({
    message,
    allActivities,
    isActiveAssistantActivity,
    activeActivityId,
    leadingProgressSegments,
    trailingProgressSegments,
  }: {
    message: Message;
    allActivities: NonNullable<Message['activities']>;
    isActiveAssistantActivity: boolean;
    activeActivityId?: string;
    leadingProgressSegments: Array<ProgressSnapshot & {isStreaming: boolean}>;
    trailingProgressSegments: Array<ProgressSnapshot & {isStreaming: boolean}>;
  }) {
    if (allActivities.length > 0) {
      const {leadingActivities, trailingActivities} =
        this.partitionAssistantActivities(allActivities);

      return html`
        ${this.renderProgressSegments(leadingProgressSegments, message.id)}
        ${this.renderActivities(
          leadingActivities,
          allActivities,
          isActiveAssistantActivity,
          activeActivityId
        )}
        ${this.renderMessageBody(message, isActiveAssistantActivity)}
        ${this.renderActivities(
          trailingActivities,
          allActivities,
          isActiveAssistantActivity,
          activeActivityId
        )}
        ${this.renderProgressSegments(trailingProgressSegments, message.id)}
      `;
    }

    return html`
      ${this.renderMessageBody(message, isActiveAssistantActivity)}
      ${this.renderProgressSegments(leadingProgressSegments, message.id)}
      ${this.renderActivities(
        allActivities,
        allActivities,
        isActiveAssistantActivity,
        activeActivityId
      )}
      ${this.renderProgressSegments(trailingProgressSegments, message.id)}
    `;
  }

  private partitionAssistantActivities(
    activities: NonNullable<Message['activities']>
  ) {
    const leadingActivities = activities.filter(
      (activity) => !this.activityContainsNextActions(activity)
    );
    const trailingActivities = activities.filter((activity) =>
      this.activityContainsNextActions(activity)
    );

    return {leadingActivities, trailingActivities};
  }

  private renderMessageBody(
    message: Message,
    isActiveAssistantActivity: boolean
  ) {
    const content = this.getMessageContent(message, isActiveAssistantActivity);

    return when(
      message.role === 'user',
      () =>
        html`<p class="message-content message-content--plain">${content}</p>`,
      () => {
        if (!content && isActiveAssistantActivity) {
          return html``;
        }

        return when(
          Boolean(content),
          () =>
            html`<div class="message-content message-content--markdown">
              ${unsafeHTML(renderMarkdown(content))}
            </div>`
        );
      }
    );
  }

  private getProgressSegmentsForMessage(
    messageId: string,
    isLatestAssistantMessage: boolean
  ) {
    if (isLatestAssistantMessage) {
      if (
        this.isLoading ||
        this.progressTrace.length > 0 ||
        this.progressSteps.length > 0
      ) {
        const segments = this.buildCurrentProgressSegments();
        const displaySegments = this.isLoading
          ? segments
          : [this.mergeProgressSegments(segments)];

        return displaySegments.map((segment, index) => ({
          ...segment,
          isStreaming: this.isLoading && index === displaySegments.length - 1,
        }));
      }
    }

    const historySegments = this.progressHistoryByMessageId[messageId] ?? [];
    const displayHistorySegments =
      historySegments.length > 1
        ? [this.mergeProgressSegments(historySegments)]
        : historySegments;

    return displayHistorySegments.map((segment) => ({
      ...segment,
      isStreaming: false,
    }));
  }

  private buildCurrentProgressSegments(): ProgressSnapshot[] {
    const segments: ProgressSnapshot[] = [];

    for (let i = 0; i < this.currentTraceSegmentStarts.length; i++) {
      const currentStart = this.currentTraceSegmentStarts[i];
      const nextStart = this.currentTraceSegmentStarts[i + 1];
      const progressSteps = this.progressSteps.slice(
        currentStart.stepStart,
        nextStart?.stepStart
      );
      const progressTrace = this.progressTrace.slice(
        currentStart.traceStart,
        nextStart?.traceStart
      );
      const isLastSegment = i === this.currentTraceSegmentStarts.length - 1;

      if (
        progressSteps.length === 0 &&
        progressTrace.length === 0 &&
        !isLastSegment
      ) {
        continue;
      }

      segments.push({progressSteps, progressTrace});
    }

    if (segments.length === 0) {
      return [
        {progressSteps: this.progressSteps, progressTrace: this.progressTrace},
      ];
    }

    return segments;
  }

  private persistLatestAssistantProgressHistory() {
    const lastAssistantId = this.getLastAssistantId();

    if (!lastAssistantId) {
      return;
    }

    const segments = this.buildCurrentProgressSegments().filter(
      (segment) =>
        segment.progressSteps.length > 0 || segment.progressTrace.length > 0
    );

    if (segments.length === 0) {
      return;
    }

    this.progressHistoryByMessageId = {
      ...this.progressHistoryByMessageId,
      [lastAssistantId]: [this.mergeProgressSegments(segments)],
    };
  }

  private mergeProgressSegments(
    segments: ProgressSnapshot[]
  ): ProgressSnapshot {
    if (segments.length <= 1) {
      return (
        segments[0] ?? {
          progressSteps: this.progressSteps,
          progressTrace: this.progressTrace,
        }
      );
    }

    return {
      progressSteps: segments.flatMap((segment) => segment.progressSteps),
      progressTrace: segments.flatMap((segment) => segment.progressTrace),
    };
  }

  private pruneProgressHistory() {
    const assistantIds = new Set(
      this.messages
        .filter((message) => message.role === 'assistant')
        .map((message) => message.id)
    );
    const nextHistoryEntries = Object.entries(this.progressHistoryByMessageId)
      .filter(([messageId]) => assistantIds.has(messageId))
      .reduce<Record<string, ProgressSnapshot[]>>(
        (acc, [messageId, progressSnapshot]) => {
          acc[messageId] = progressSnapshot;
          return acc;
        },
        {}
      );

    this.progressHistoryByMessageId = nextHistoryEntries;
  }

  private renderProgressSegments(
    segments: Array<ProgressSnapshot & {isStreaming: boolean}>,
    messageId?: string
  ) {
    if (segments.length === 0) {
      return html``;
    }

    return map(segments, (segment, index) => {
      const hasStatus =
        segment.isStreaming ||
        segment.progressTrace.length > 0 ||
        segment.progressSteps.length > 0;

      return when(
        hasStatus,
        () => html`
          <cac-progress-trace
            .progressTrace=${segment.progressTrace}
            .progressSteps=${segment.progressSteps}
            .isStreaming=${segment.isStreaming}
            .messageId=${`${messageId ?? 'message'}-segment-${index}`}
          ></cac-progress-trace>
        `
      );
    });
  }

  private renderActivities(
    activitiesToRender: NonNullable<Message['activities']>,
    allActivities: NonNullable<Message['activities']>,
    isActiveAssistantActivity: boolean,
    activeActivityId?: string
  ) {
    const bundleProducts = this.buildBundleProducts(allActivities);

    return map(
      activitiesToRender,
      (activity) => html`
        <cac-activity-renderer
          .activity=${activity}
          .isLoading=${isActiveAssistantActivity &&
          activity.id === activeActivityId}
          .bundleProducts=${bundleProducts}
          .allowNextActionsFallback=${this.activityContainsNextActions(
            activity
          )}
        ></cac-activity-renderer>
      `
    );
  }

  private activityContainsNextActions(activity: ActivityMessage) {
    const operations = this.getSurfaceOperations(activity);

    return operations.some((operation) =>
      (operation.surfaceUpdate?.components ?? []).some((component) => {
        const componentType = Object.keys(component.component ?? {})[0] ?? '';
        return isType(componentType, 'NextActionsBar');
      })
    );
  }

  private buildBundleProducts(
    activities: Message['activities']
  ): Map<string, Product[]> {
    const operations = (activities ?? [])
      .filter((a) => a.activityType === 'a2ui-surface')
      .flatMap((a) => this.getSurfaceOperations(a));
    return extractProductsBySurface(operations);
  }

  private getMessageContent(
    message: Message,
    isActiveAssistantActivity: boolean
  ) {
    if (message.role === 'assistant') {
      return message.content ?? '';
    }

    return message.content || (isActiveAssistantActivity ? '' : '...');
  }

  private getLastAssistantId() {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];

      if (message.role === 'assistant') {
        return message.id;
      }
    }

    return undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-message-list': CacMessageList;
  }
}
