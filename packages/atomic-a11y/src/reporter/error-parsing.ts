import type {TestCase} from 'vitest/node';
import {isRecord} from '../shared/guards.js';
import {compareByNumericId} from '../shared/sorting.js';

const AXE_RULE_URL_PATTERN = /rules\/axe\/[\d.]+\/([a-z0-9-]+)/gi;
const AXE_RULE_TOKEN_PATTERN = /\(([a-z0-9-]+)\)/gi;
// TODO: Consider using a more robust ANSI escape code parser if needed, such as the 'ansi-regex' package.
// biome-ignore lint/suspicious/noControlCharactersInRegex: In progress...
const ANSI_ESCAPE_PATTERN = /\u001B\[[0-?]*[ -/]*[@-~]/g;

export function stripAnsiSequences(text: string): string {
  return text.replace(ANSI_ESCAPE_PATTERN, '');
}

export function extractErrorText(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return `${error.message}\n${error.stack ?? ''}`;
  }

  if (!isRecord(error)) {
    return '';
  }

  const message = typeof error.message === 'string' ? error.message : '';
  const stack = typeof error.stack === 'string' ? error.stack : '';
  return `${message}\n${stack}`;
}

export function collectRuleIdMatches(
  source: string,
  matcher: RegExp,
  target: Set<string>,
  getCriteriaForRuleIdFn: (ruleId: string) => string[]
): void {
  matcher.lastIndex = 0;
  let match = matcher.exec(source);

  while (match) {
    const matchedRuleId = match[1]?.toLowerCase();
    if (matchedRuleId && getCriteriaForRuleIdFn(matchedRuleId).length > 0) {
      target.add(matchedRuleId);
    }

    match = matcher.exec(source);
  }
}

export function extractA11yRuleIdsFromTestErrors(
  testCase: TestCase,
  getCriteriaForRuleIdFn: (ruleId: string) => string[]
): string[] {
  const errors = testCase.result().errors;
  if (!errors || errors.length === 0) {
    return [];
  }

  const extractedRuleIds = new Set<string>();

  for (const error of errors) {
    const errorText = stripAnsiSequences(extractErrorText(error));
    if (!errorText) {
      continue;
    }

    const normalizedErrorText = errorText.toLowerCase();
    const appearsToBeA11yAssertionFailure =
      normalizedErrorText.includes('tohavenoviolations') ||
      normalizedErrorText.includes('application=axeapi');

    if (!appearsToBeA11yAssertionFailure) {
      continue;
    }

    collectRuleIdMatches(
      errorText,
      AXE_RULE_URL_PATTERN,
      extractedRuleIds,
      getCriteriaForRuleIdFn
    );
    collectRuleIdMatches(
      errorText,
      AXE_RULE_TOKEN_PATTERN,
      extractedRuleIds,
      getCriteriaForRuleIdFn
    );
  }

  return [...extractedRuleIds].sort(compareByNumericId);
}
