import {describe, expect, it} from 'vitest';
import {isA11yReport, isRecord} from '../shared/guards.js';

describe('isRecord()', () => {
  it('should return true for empty object', () => {
    expect(isRecord({})).toBe(true);
  });

  it('should return true for plain object with properties', () => {
    expect(isRecord({key: 'value'})).toBe(true);
    expect(isRecord({a: 1, b: 2, c: 3})).toBe(true);
  });

  it('should return true for nested objects', () => {
    expect(isRecord({nested: {inner: 'value'}})).toBe(true);
  });

  it('should return false for null', () => {
    expect(isRecord(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isRecord(undefined)).toBe(false);
  });

  it('should return false for primitive numbers', () => {
    expect(isRecord(42)).toBe(false);
    expect(isRecord(0)).toBe(false);
    expect(isRecord(-1)).toBe(false);
  });

  it('should return false for primitive strings', () => {
    expect(isRecord('string')).toBe(false);
    expect(isRecord('')).toBe(false);
  });

  it('should return false for boolean values', () => {
    expect(isRecord(true)).toBe(false);
    expect(isRecord(false)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([1, 2, 3])).toBe(false);
    expect(isRecord(['a', 'b'])).toBe(false);
  });
});

describe('isA11yReport()', () => {
  it('should return true for valid report shape', () => {
    const validReport = {
      report: {product: 'test'},
      components: [],
      criteria: [],
      summary: {totalComponents: 0},
    };
    expect(isA11yReport(validReport)).toBe(true);
  });

  it('should return true for valid report with populated arrays', () => {
    const validReport = {
      report: {product: 'test', version: '1.0'},
      components: [{name: 'button'}],
      criteria: [{id: '1.1.1'}],
      summary: {totalComponents: 1, litComponents: 1},
    };
    expect(isA11yReport(validReport)).toBe(true);
  });

  it('should return false when report property is missing', () => {
    const invalid = {
      components: [],
      criteria: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when components property is missing', () => {
    const invalid = {
      report: {},
      criteria: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when criteria property is missing', () => {
    const invalid = {
      report: {},
      components: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when summary property is missing', () => {
    const invalid = {
      report: {},
      components: [],
      criteria: [],
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when report is not an object', () => {
    const invalid = {
      report: 'not-an-object',
      components: [],
      criteria: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when report is null', () => {
    const invalid = {
      report: null,
      components: [],
      criteria: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when report is an array', () => {
    const invalid = {
      report: [],
      components: [],
      criteria: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when components is not an array', () => {
    const invalid = {
      report: {},
      components: 'not-an-array',
      criteria: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when components is an object', () => {
    const invalid = {
      report: {},
      components: {item: 'object'},
      criteria: [],
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when criteria is not an array', () => {
    const invalid = {
      report: {},
      components: [],
      criteria: 'not-an-array',
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when criteria is an object', () => {
    const invalid = {
      report: {},
      components: [],
      criteria: {item: 'object'},
      summary: {},
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when summary is not an object', () => {
    const invalid = {
      report: {},
      components: [],
      criteria: [],
      summary: 'not-an-object',
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when summary is null', () => {
    const invalid = {
      report: {},
      components: [],
      criteria: [],
      summary: null,
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false when summary is an array', () => {
    const invalid = {
      report: {},
      components: [],
      criteria: [],
      summary: [],
    };
    expect(isA11yReport(invalid)).toBe(false);
  });

  it('should return false for non-objects (null)', () => {
    expect(isA11yReport(null)).toBe(false);
  });

  it('should return false for non-objects (string)', () => {
    expect(isA11yReport('report')).toBe(false);
  });

  it('should return false for non-objects (number)', () => {
    expect(isA11yReport(42)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isA11yReport([])).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isA11yReport(undefined)).toBe(false);
  });
});
