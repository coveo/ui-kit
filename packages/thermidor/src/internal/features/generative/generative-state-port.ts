import type {
  A2UISurface,
  Activity,
  HydratedUseCase,
  TurnStatus,
  UseCaseInterfaceMap,
} from './generative-types.js';

export interface HydrationResult<K extends HydratedUseCase = HydratedUseCase> {
  useCase: K;
  interface: UseCaseInterfaceMap[K];
  snapshot: Record<string, unknown>;
  query: string | undefined;
  surfaceId?: string;
}

export interface GenerativeStatePort {
  createTurn(payload: {id: string; prompt: string; status: TurnStatus}): void;
  setActiveTurnId(id: string): void;
  getActiveTurnId(): string | undefined;
  replaceTurnId(oldId: string, newId: string): void;
  setRoutedInterface(turnId: string, hydrationResult: HydrationResult): void;
  clearRoutedInterface(turnId: string, surfaceId: string): void;
  initAgentResponse(turnId: string): void;
  startMessage(turnId: string, role: string): void;
  appendMessageDelta(turnId: string, delta: string): void;
  appendSurface(
    turnId: string,
    surface: A2UISurface,
    activity?: {id?: string; replace?: boolean}
  ): void;
  appendActivity(turnId: string, activity: Activity): void;
  setStateSnapshot(turnId: string, state: Record<string, unknown>): void;
  startToolCall(turnId: string, toolCallId: string, toolName: string): void;
  appendToolCallArgs(turnId: string, toolCallId: string, delta: string): void;
  completeToolCall(turnId: string, toolCallId: string, result: string): void;
  completeTurn(turnId: string): void;
  failTurn(turnId: string, error: string): void;
  clearTurnResponse(turnId: string): void;
  startReasoning(turnId: string): void;
  appendReasoningDelta(turnId: string, delta: string): void;
  endReasoning(turnId: string): void;
  setConversationSession(sessionId: string | undefined, token: string | undefined): void;
}
