/**
 * Minimal structural types for dynamically imported packages (playwright, openai).
 *
 * These describe only the API surface actually used by the audit scripts.
 * They avoid requiring the packages at compile time while providing type safety.
 */

import type {AccessibilityNode} from './accessibility-tree.js';

// ---------------------------------------------------------------------------
// Playwright
// ---------------------------------------------------------------------------

export interface PlaywrightLocator {
  count(): Promise<number>;
  nth(index: number): PlaywrightLocator;
  isVisible(): Promise<boolean>;
  hover(options?: {timeout?: number; force?: boolean}): Promise<void>;
  evaluate<R>(fn: (el: Element) => R): Promise<R>;
}

export interface PlaywrightMouse {
  move(x: number, y: number): Promise<void>;
}

export interface PlaywrightAccessibility {
  snapshot(options?: {
    interestingOnly?: boolean;
  }): Promise<AccessibilityNode | null>;
}

export interface PlaywrightPage {
  setViewportSize(size: {width: number; height: number}): Promise<void>;
  goto(
    url: string,
    options?: {waitUntil?: string; timeout?: number}
  ): Promise<unknown>;
  waitForTimeout(ms: number): Promise<void>;
  screenshot(options?: {
    type?: 'png' | 'jpeg';
    fullPage?: boolean;
  }): Promise<Buffer>;
  accessibility: PlaywrightAccessibility;
  locator(selector: string): PlaywrightLocator;
  mouse: PlaywrightMouse;
  evaluate<R>(fn: () => R): Promise<R>;
}

export interface PlaywrightBrowser {
  newPage(): Promise<PlaywrightPage>;
  close(): Promise<void>;
}

// ---------------------------------------------------------------------------
// OpenAI
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: string;
  content: string | null;
}

export interface ChatChoice {
  message: ChatMessage;
}

export interface ChatCompletionResponse {
  choices: ChatChoice[];
}

export interface ChatCompletionsAPI {
  create(options: {
    model: string;
    messages: unknown[];
    response_format?: {type: string};
    temperature?: number;
  }): Promise<ChatCompletionResponse>;
}

export interface OpenAIChat {
  completions: ChatCompletionsAPI;
}

export interface OpenAIClient {
  chat: OpenAIChat;
}
