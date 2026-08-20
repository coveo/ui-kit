import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import type {AtomicFieldCondition} from './atomic-field-condition.js';
import './atomic-field-condition.js';

describe('atomic-field-condition', () => {
  const renderFieldCondition = async ({
    ifDefined = '',
    ifNotDefined = '',
    mustMatch = {},
    mustNotMatch = {},
    resultState = {},
  }: {
    ifDefined?: string;
    ifNotDefined?: string;
    mustMatch?: Record<string, unknown>;
    mustNotMatch?: Record<string, unknown>;
    resultState?: Partial<Result>;
  } = {}) => {
    const result = buildFakeResult(resultState);

    const {element, atomicResult} = await renderInAtomicResult<AtomicFieldCondition>({
      template: html`
        <atomic-field-condition
          if-defined="${ifDefined}"
          if-not-defined="${ifNotDefined}"
          .mustMatch="${mustMatch}"
          .mustNotMatch="${mustNotMatch}"
        >
          <span id="condition-met">Condition Met</span>
        </atomic-field-condition>
      `,
      selector: 'atomic-field-condition',
      result,
    });

    // Deliberately queried from the result rather than from the condition element, and
    // returned as a boolean, so that the assertions describe what the user can see instead
    // of how the component hides its content.
    const isContentVisible = () => {
      const content = atomicResult.shadowRoot!.querySelector<HTMLElement>('#condition-met');
      return content !== null && content.checkVisibility();
    };

    return {element, atomicResult, isContentVisible};
  };

  it('should render its content when no conditions are defined', async () => {
    const {isContentVisible} = await renderFieldCondition();
    expect(isContentVisible()).toBe(true);
  });

  it('should render its content when an if-defined condition is met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      ifDefined: 'author',
      resultState: {raw: {author: 'John Doe'}},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when an if-defined condition is not met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      ifDefined: 'author',
      resultState: {raw: {}},
    });

    expect(isContentVisible()).toBe(false);
  });

  it('should render its content when an if-not-defined condition is met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      ifNotDefined: 'author',
      resultState: {raw: {}},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when an if-not-defined condition is not met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      ifNotDefined: 'author',
      resultState: {raw: {author: 'John Doe'}},
    });

    expect(isContentVisible()).toBe(false);
  });

  it('should render its content when a must-match condition is met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      mustMatch: {filetype: ['pdf']},
      resultState: {raw: {filetype: 'pdf'}},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when a must-match condition is not met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      mustMatch: {filetype: ['pdf']},
      resultState: {raw: {filetype: 'docx'}},
    });

    expect(isContentVisible()).toBe(false);
  });

  it('should render its content when a must-not-match condition is met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      mustNotMatch: {filetype: ['docx']},
      resultState: {raw: {filetype: 'pdf'}},
    });

    expect(isContentVisible()).toBe(true);
  });

  it('should not render its content when a must-not-match condition is not met', async () => {
    const {isContentVisible} = await renderFieldCondition({
      mustNotMatch: {filetype: ['docx']},
      resultState: {raw: {filetype: 'docx'}},
    });

    expect(isContentVisible()).toBe(false);
  });

  it('should stay in the DOM when its conditions are not met', async () => {
    const {atomicResult} = await renderFieldCondition({
      ifDefined: 'author',
      resultState: {raw: {}},
    });

    expect(atomicResult.shadowRoot!.querySelector('atomic-field-condition')).not.toBeNull();
  });

  it('should reevaluate its conditions when they change after the initial render', async () => {
    const {element, isContentVisible} = await renderFieldCondition({
      mustMatch: {filetype: ['pdf']},
      resultState: {raw: {filetype: 'docx'}},
    });

    expect(isContentVisible()).toBe(false);

    expect(element).not.toBeNull();
    element.mustMatch = {filetype: ['docx']};
    await element.updateComplete;

    expect(isContentVisible()).toBe(true);
  });
});
