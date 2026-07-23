import {describe, expect, it} from 'vitest';
import {buildCrashDisclosure, isTrackingDisabled} from './telemetry.js';

describe('isTrackingDisabled', () => {
  it('is false when DO_NOT_TRACK is unset', () => {
    expect(isTrackingDisabled({})).toBe(false);
  });

  it('is false for an empty value or "0"', () => {
    expect(isTrackingDisabled({DO_NOT_TRACK: ''})).toBe(false);
    expect(isTrackingDisabled({DO_NOT_TRACK: '   '})).toBe(false);
    expect(isTrackingDisabled({DO_NOT_TRACK: '0'})).toBe(false);
  });

  it('is true for any other non-empty value', () => {
    expect(isTrackingDisabled({DO_NOT_TRACK: '1'})).toBe(true);
    expect(isTrackingDisabled({DO_NOT_TRACK: 'true'})).toBe(true);
    expect(isTrackingDisabled({DO_NOT_TRACK: 'yes'})).toBe(true);
  });
});

describe('buildCrashDisclosure', () => {
  const disclosure = buildCrashDisclosure('/tmp/create-ui-crash-abc.json');

  it('shows the report path and the submit command', () => {
    expect(disclosure).toContain('/tmp/create-ui-crash-abc.json');
    expect(disclosure).toContain(
      'npx @coveo/create-ui report /tmp/create-ui-crash-abc.json'
    );
  });

  it('mentions the opt-out mechanism', () => {
    expect(disclosure).toContain('DO_NOT_TRACK=1');
  });
});
