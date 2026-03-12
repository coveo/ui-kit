/**
 * Minimal structural types for dynamically imported packages (playwright, openai).
 *
 * These describe only the API surface actually used by the audit scripts.
 * They avoid requiring the packages at compile time while providing type safety.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AccessibilityNode {
  role?: string;
  name?: string;
  value?: string | number;
  description?: string;
  bbox?: BoundingBox;
  children?: AccessibilityNode[];
}

// ---------------------------------------------------------------------------
// Playwright
// ---------------------------------------------------------------------------

export interface PlaywrightLocator {
  count(): Promise<number>;
  nth(index: number): PlaywrightLocator;
  isVisible(): Promise<boolean>;
  hover(options?: {timeout?: number; force?: boolean}): Promise<void>;
  focus(): Promise<void>;
  click(options?: {timeout?: number; force?: boolean}): Promise<void>;
  evaluate<R>(fn: (el: Element) => R): Promise<R>;
  textContent(): Promise<string | null>;
  allTextContents(): Promise<string[]>;
}

export interface LiveRegionChange {
  action: string;
  selector: string;
  regionName: string;
  announcementText: string;
  ariaLive: 'polite' | 'assertive';
  offsetMs: number;
  noAnnouncement?: boolean;
  source?: 'interaction' | 'on-load';
}

export interface LiveRegionCaptureResult {
  liveRegionChanges: LiveRegionChange[];
  summary: string;
}

export interface PlaywrightKeyboard {
  press(key: string): Promise<void>;
}

export interface PlaywrightMouse {
  move(x: number, y: number): Promise<void>;
  click(x: number, y: number): Promise<void>;
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
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
  keyboard: PlaywrightKeyboard;
  reload(options?: {waitUntil?: string}): Promise<unknown>;
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
