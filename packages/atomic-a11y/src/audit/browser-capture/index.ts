/**
 * Browser capture utilities for accessibility auditing.
 *
 * Provides Playwright-based browser automation for capturing screenshots,
 * ARIA snapshots, and interaction states from Storybook stories.
 */

export {
  type CaptureResult,
  captureDefaultViewport,
} from './default-viewport.js';
export {captureFocusStates, type FocusCaptureResult} from './focus.js';
export {captureHoverState, type HoverCaptureResult} from './hover.js';
export {
  type BrowserContext,
  initBrowser,
  navigateToStory,
  type PlaywrightBrowser,
  type PlaywrightPage,
} from './init.js';
export {
  captureMultiViewport,
  type MultiViewportResult,
} from './multi-viewport.js';
export {captureTargetSizes, type TargetSizeResult} from './target-size.js';
export {captureTextSpacing, type TextSpacingResult} from './text-spacing.js';
