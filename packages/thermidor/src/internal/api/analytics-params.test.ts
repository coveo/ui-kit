import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {buildAnalyticsParams} from './analytics-params.js';
import type {FullEngine} from '@/src/internal/engine/index.js';

function createMockEngine(
  navigatorContext?: {
    clientId: string;
    location: string | null;
    referrer: string | null;
    userAgent: string | null;
  } | null
): FullEngine {
  return {
    getNavigatorContextProvider: () =>
      navigatorContext === null ? undefined : () => navigatorContext!,
  } as unknown as FullEngine;
}

describe('buildAnalyticsParams', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns undefined when navigator context provider is not available', () => {
    const engine = createMockEngine(null);

    const result = buildAnalyticsParams(engine, {originContext: 'Search'});

    expect(result).toBeUndefined();
  });

  it('builds analytics params from navigator context', () => {
    const engine = createMockEngine({
      clientId: 'client-123',
      location: 'https://example.com/search',
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0',
    });

    const result = buildAnalyticsParams(engine, {originContext: 'Search'});

    expect(result).toEqual({
      clientId: 'client-123',
      clientTimestamp: '2026-01-15T10:30:00.000Z',
      documentReferrer: 'https://google.com',
      originContext: 'Search',
      documentLocation: 'https://example.com/search',
    });
  });

  it('includes trackingId when provided and non-empty', () => {
    const engine = createMockEngine({
      clientId: 'client-123',
      location: null,
      referrer: null,
      userAgent: null,
    });

    const result = buildAnalyticsParams(engine, {
      originContext: 'Search',
      trackingId: 'tracking-456',
    });

    expect(result).toEqual(
      expect.objectContaining({trackingId: 'tracking-456'})
    );
  });

  it('omits trackingId when it is an empty string', () => {
    const engine = createMockEngine({
      clientId: 'client-123',
      location: null,
      referrer: null,
      userAgent: null,
    });

    const result = buildAnalyticsParams(engine, {
      originContext: 'Search',
      trackingId: '',
    });

    expect(result).not.toHaveProperty('trackingId');
  });

  it('omits trackingId when not provided', () => {
    const engine = createMockEngine({
      clientId: 'client-123',
      location: null,
      referrer: null,
      userAgent: null,
    });

    const result = buildAnalyticsParams(engine, {originContext: 'Search'});

    expect(result).not.toHaveProperty('trackingId');
  });

  it('uses the provided originContext', () => {
    const engine = createMockEngine({
      clientId: 'client-123',
      location: null,
      referrer: null,
      userAgent: null,
    });

    const result = buildAnalyticsParams(engine, {
      originContext: 'Recommendation',
    });

    expect(result?.originContext).toBe('Recommendation');
  });

  it('handles null referrer and location from navigator context', () => {
    const engine = createMockEngine({
      clientId: 'client-123',
      location: null,
      referrer: null,
      userAgent: null,
    });

    const result = buildAnalyticsParams(engine, {originContext: 'Search'});

    expect(result?.documentReferrer).toBeNull();
    expect(result?.documentLocation).toBeNull();
  });
});
