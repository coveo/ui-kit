import {describe, expect, it} from 'vitest';
import {
  collectRuleIdMatches,
  extractA11yRuleIdsFromTestErrors,
  extractErrorText,
  stripAnsiSequences,
} from '../reporter/error-parsing.js';
import {createMockTestCase} from './helpers/mock-factories.js';

describe('error-parsing', () => {
  describe('stripAnsiSequences()', () => {
    it('removes ANSI color codes from text', () => {
      const input = '\u001B[31mError\u001B[39m';
      expect(stripAnsiSequences(input)).toBe('Error');
    });

    it('removes multiple ANSI sequences', () => {
      const input = '\u001B[31mError\u001B[39m \u001B[32mwarning\u001B[39m';
      expect(stripAnsiSequences(input)).toBe('Error warning');
    });

    it('handles text with no ANSI sequences', () => {
      const input = 'Plain text without codes';
      expect(stripAnsiSequences(input)).toBe('Plain text without codes');
    });

    it('returns empty string when input is empty', () => {
      expect(stripAnsiSequences('')).toBe('');
    });

    it('removes complex ANSI escape sequences', () => {
      const input =
        '\u001B[1;31mBold Red\u001B[0m Normal \u001B[4;32mUnderline Green\u001B[0m';
      expect(stripAnsiSequences(input)).toBe('Bold Red Normal Underline Green');
    });
  });

  describe('extractErrorText()', () => {
    it('returns string input as-is', () => {
      const input = 'plain string error';
      expect(extractErrorText(input)).toBe(input);
    });

    it('extracts message and stack from Error instance', () => {
      const error = new Error('test message');
      const result = extractErrorText(error);
      expect(result).toContain('test message');
      expect(result).toContain('Error:');
    });

    it('returns message and stack separated by newline for Error instance', () => {
      const error = new Error('test message');
      const result = extractErrorText(error);
      expect(result.split('\n')[0]).toBe('test message');
    });

    it('extracts message and stack from record object with both properties', () => {
      const error = {message: 'custom message', stack: 'custom stack'};
      const result = extractErrorText(error);
      expect(result).toBe('custom message\ncustom stack');
    });

    it('extracts only message from record with message but no stack', () => {
      const error = {message: 'only message'};
      const result = extractErrorText(error);
      expect(result).toBe('only message\n');
    });

    it('returns empty string for non-record non-string input', () => {
      expect(extractErrorText(123)).toBe('');
      expect(extractErrorText(null)).toBe('');
      expect(extractErrorText(undefined)).toBe('');
      expect(extractErrorText([])).toBe('');
    });

    it('ignores non-string message and stack properties in record', () => {
      const error = {message: 123, stack: true};
      expect(extractErrorText(error)).toBe('\n');
    });
  });

  describe('collectRuleIdMatches()', () => {
    it('extracts rule IDs from axe rule URL pattern', () => {
      const source = 'rules/axe/4.10.0/color-contrast';
      const target = new Set<string>();
      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'color-contrast' ? ['1.4.3'] : [];

      collectRuleIdMatches(
        source,
        /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi,
        target,
        getCriteriaForRuleIdFn
      );

      expect(target).toContain('color-contrast');
    });

    it('extracts rule IDs from token pattern', () => {
      const source = 'violation found (button-name)';
      const target = new Set<string>();
      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'button-name' ? ['4.1.2'] : [];

      collectRuleIdMatches(
        source,
        /\(([a-z0-9-]+)\)/gi,
        target,
        getCriteriaForRuleIdFn
      );

      expect(target).toContain('button-name');
    });

    it('converts matched rule IDs to lowercase', () => {
      const source = 'rules/axe/4.10.0/Color-Contrast';
      const target = new Set<string>();
      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'color-contrast' ? ['1.4.3'] : [];

      collectRuleIdMatches(
        source,
        /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi,
        target,
        getCriteriaForRuleIdFn
      );

      expect(target).toContain('color-contrast');
    });

    it('only adds rules that have WCAG criteria', () => {
      const source =
        'rules/axe/4.10.0/color-contrast rules/axe/4.10.0/unknown-rule';
      const target = new Set<string>();
      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'color-contrast' ? ['1.4.3'] : [];

      collectRuleIdMatches(
        source,
        /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi,
        target,
        getCriteriaForRuleIdFn
      );

      expect(target).toContain('color-contrast');
      expect(target).not.toContain('unknown-rule');
      expect(target.size).toBe(1);
    });

    it('accumulates matches to existing set', () => {
      const target = new Set(['existing-rule']);
      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'color-contrast' ? ['1.4.3'] : [];

      collectRuleIdMatches(
        'rules/axe/4.10.0/color-contrast',
        /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi,
        target,
        getCriteriaForRuleIdFn
      );

      expect(target).toContain('existing-rule');
      expect(target).toContain('color-contrast');
      expect(target.size).toBe(2);
    });

    it('handles multiple matches in single source string', () => {
      const source =
        'rules/axe/4.10.0/color-contrast rules/axe/4.10.0/button-name';
      const target = new Set<string>();
      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ['color-contrast', 'button-name'].includes(ruleId) ? ['1.4.3'] : [];

      collectRuleIdMatches(
        source,
        /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi,
        target,
        getCriteriaForRuleIdFn
      );

      expect(target).toContain('color-contrast');
      expect(target).toContain('button-name');
      expect(target.size).toBe(2);
    });
  });

  describe('extractA11yRuleIdsFromTestErrors()', () => {
    it('returns empty array when test case has no errors', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({errors: []});

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        () => []
      );

      expect(result).toEqual([]);
    });

    it('extracts rule IDs from axe URLs in error messages', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'toHaveNoViolations failed',
            stack:
              'rules/axe/4.10.0/color-contrast rules/axe/4.10.0/button-name',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ['color-contrast', 'button-name'].includes(ruleId) ? ['1.4.3'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toContain('color-contrast');
      expect(result).toContain('button-name');
    });

    it('extracts rule IDs from token patterns (parentheses)', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message:
              'toHaveNoViolations failed: (color-contrast) (button-name)',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ['color-contrast', 'button-name'].includes(ruleId) ? ['1.4.3'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toContain('color-contrast');
      expect(result).toContain('button-name');
    });

    it('skips non-a11y errors that lack tohavenoviolations or application=axeapi', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'Generic error',
            stack: 'rules/axe/4.10.0/color-contrast',
          },
        ],
      });

      const result = extractA11yRuleIdsFromTestErrors(testCase as never, () => [
        '1.4.3',
      ]);

      expect(result).toEqual([]);
    });

    it('recognizes tohavenoviolations keyword (case-insensitive)', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'toHaveNoViolations failed',
            stack: 'rules/axe/4.10.0/color-contrast',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'color-contrast' ? ['1.4.3'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toContain('color-contrast');
    });

    it('recognizes application=axeapi keyword (case-insensitive)', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'Axe API Error: application=axeAPI',
            stack: 'rules/axe/4.10.0/image-alt',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'image-alt' ? ['1.1.1'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toContain('image-alt');
    });

    it('removes duplicate rule IDs', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'toHaveNoViolations failed',
            stack: 'rules/axe/4.10.0/color-contrast (color-contrast)',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'color-contrast' ? ['1.4.3'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toEqual(['color-contrast']);
    });

    it('sorts rule IDs numerically', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'toHaveNoViolations failed',
            stack:
              'rules/axe/4.10.0/rule-10 rules/axe/4.10.0/rule-2 rules/axe/4.10.0/rule-1',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId.startsWith('rule-') ? ['1.1.1'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toEqual(['rule-1', 'rule-2', 'rule-10']);
    });

    it('handles ANSI codes in error messages', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: '\u001B[31mtoHaveNoViolations\u001B[39m failed',
            stack: 'rules/axe/4.10.0/color-contrast',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ruleId === 'color-contrast' ? ['1.4.3'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toContain('color-contrast');
    });

    it('returns empty array when errors lack rule IDs', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'toHaveNoViolations failed: no rule IDs found',
          },
        ],
      });

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        () => []
      );

      expect(result).toEqual([]);
    });

    it('handles multiple error objects in errors array', () => {
      const testCase = createMockTestCase({
        id: 'storybook-test--default',
        projectName: 'storybook',
      });

      (testCase as Record<string, unknown>).result = () => ({
        errors: [
          {
            message: 'toHaveNoViolations failed',
            stack: 'rules/axe/4.10.0/color-contrast',
          },
          {
            message: 'toHaveNoViolations failed',
            stack: 'rules/axe/4.10.0/button-name',
          },
        ],
      });

      const getCriteriaForRuleIdFn = (ruleId: string) =>
        ['color-contrast', 'button-name'].includes(ruleId) ? ['1.4.3'] : [];

      const result = extractA11yRuleIdsFromTestErrors(
        testCase as never,
        getCriteriaForRuleIdFn
      );

      expect(result).toContain('color-contrast');
      expect(result).toContain('button-name');
      expect(result.length).toBe(2);
    });
  });
});
