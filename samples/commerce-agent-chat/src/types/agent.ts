import type {BaseEvent} from '@ag-ui/core';
import type {Observable} from 'rxjs';

export interface AgentInvocation {
  runId: string;
  events: Observable<BaseEvent>;
}

export interface RunAgentInput {
  messages: Message[];
  threadId: string;
  runId: string;
  state: Record<string, unknown>;
  tools: unknown[];
  context: unknown[];
  forwardedProps: ForwardedProps | {};
}

export interface ActivityMessage {
  id: string;
  activityType: string;
  content: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  activities?: ActivityMessage[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
  error: string | null;
  threadId: string;
}

export interface ParsedEvent {
  type:
    | 'message'
    | 'activity_snapshot'
    | 'activity_delta'
    | 'lifecycle'
    | 'error';
  content?: string;
  activitySnapshot?: {
    messageId: string;
    activityType: string;
    content: Record<string, unknown>;
  };
  activityDelta?: {
    messageId: string;
    activityType: string;
    patch: unknown[];
  };
  error?: string;
}

export interface CoveoDevPayload {
  clientId: string;
  context: CoveoContext;
  conversationSessionId: string;
  country: string;
  currency: string;
  language: string;
  message: string;
  targetEngine: 'AGENT_CORE';
  trackingId: string;
}

interface ForwardedProps {
  coveo: CoveoForwardedProps;
}

interface CoveoForwardedProps {
  accessToken: string;
  clientId: string;
  context: CoveoContext;
  currency: string;
  locale: string;
  organizationId: string;
  platformUrl: string;
  timezone?: string;
  trackingId: string;
}

interface CoveoContext {
  cart?: unknown[];
  user?: CoveoUser;
  view: CoveoView;
}

interface CoveoView {
  referrer?: string;
  url: string;
}

interface CoveoUser {
  userAgent: string;
}
