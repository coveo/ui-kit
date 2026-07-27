// Read the Mozilla Do Not Track Field Guide
// (https://developer.mozilla.org/en-US/docs/Web/Security/Do_not_track_field_guide),
// for information on how to use the donottrack
// gathering data of actions of a user as long as it is not associated to the
// identity of that user, doNotTrack is not enabled here.

import {hasNavigator, hasWindow} from './detector';

const doNotTrackValues = ['1', 1, 'yes', true];

export function doNotTrack(): boolean {
  const checks: any[] = [];
  if (hasWindow()) {
    checks.push((<any>window).doNotTrack);
  }
  if (hasNavigator()) {
    checks.push(
      (<any>navigator).doNotTrack,
      (<any>navigator).msDoNotTrack,
      (<any>navigator).globalPrivacyControl
    );
  }
  return checks.some((value) => doNotTrackValues.indexOf(value) !== -1);
}

/**
 * Effective analytics-suppression policy for browser privacy signals.
 *
 * By default, any active browser privacy signal (Do Not Track or Global Privacy
 * Control) suppresses analytics. When `disableBrowserPrivacySignals` is explicitly
 * `true`, the integration takes ownership of privacy decisions and no browser
 * signal is honored.
 *
 * @param disableBrowserPrivacySignals When `true`, browser privacy signals (DNT and
 * GPC) are ignored. The default (`false`/`undefined`) preserves the privacy-friendly
 * behavior of honoring them.
 */
export function shouldDisableAnalyticsForPrivacy(disableBrowserPrivacySignals?: boolean): boolean {
  if (disableBrowserPrivacySignals === true) {
    return false;
  }
  return doNotTrack();
}

export default doNotTrack;
