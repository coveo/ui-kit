import {describe, expect, it} from 'vitest';
import {buildCrashDisclosure, isTrackingDisabled} from './telemetry.js';

describe('isTrackingDisabled', () => {
  it('is false when DO_NOT_TRACK is unset, empty, or "0"', () => {
    expect(isTrackingDisabled({})).toBe(false);
    expect(isTrackingDisabled({DO_NOT_TRACK: ''})).toBe(false);
    expect(isTrackingDisabled({DO_NOT_TRACK: '0'})).toBe(false);
  });

  it('is true for any other non-empty value', () => {
    expect(isTrackingDisabled({DO_NOT_TRACK: '1'})).toBe(true);
    expect(isTrackingDisabled({DO_NOT_TRACK: 'true'})).toBe(true);
  });
});

describe('buildCrashDisclosure', () => {
  it('shows the report path, short submit command, and opt-out', () => {
    const disclosure = buildCrashDisclosure(
      '/tmp/create-ui-crash-c5c41c93a851.json',
      'c5c41c93a851'
    );
    expect(disclosure).toContain(
      'A crash report was saved to: /tmp/create-ui-crash-c5c41c93a851.json'
    );
    expect(disclosure).toContain('npx @coveo/create-ui report c5c41c93a851');
    expect(disclosure).toContain('DO_NOT_TRACK=1');
  });
});
