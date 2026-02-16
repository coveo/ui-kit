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

    const {element} = await renderInAtomicResult<AtomicFieldCondition>({
      template: html`
        <atomic-field-condition
        if-defined="${ifDefined}"
        if-not-defined="${ifNotDefined}"
        .mustMatch="${mustMatch}"
        .mustNotMatch="${mustNotMatch}">
          <span id="condition-met">Condition Met</span>
      </atomic-field-condition>
      `,
      selector: 'atomic-field-condition',
      result,
    });

    return {
      element,
      content: element?.querySelector('#condition-met'),
    };
  };

  it('should render its content when no conditions are defined', async () => {
    const {element, content} = await renderFieldCondition();
    expect(element?.hidden).toBe(false);
    expect(content).toBeInTheDocument();
  });

  it('should render its content when an if-defined condition is met', async () => {
    const {element, content} = await renderFieldCondition({
      ifDefined: 'author',
      resultState: {raw: {author: 'John Doe'}},
    });

    expect(element?.hidden).toBe(false);
    expect(content).toBeInTheDocument();
  });

  it('should not render its content when an if-defined condition is not met', async () => {
    const {element} = await renderFieldCondition({
      ifDefined: 'author',
      resultState: {raw: {}},
    });

    expect(element?.hidden).toBe(true);
  });

  it('should render its content when an if-not-defined condition is met', async () => {
    const {element, content} = await renderFieldCondition({
      ifNotDefined: 'author',
      resultState: {raw: {}},
    });

    expect(element?.hidden).toBe(false);
    expect(content).toBeInTheDocument();
  });

  it('should not render its content when an if-not-defined condition is not met', async () => {
    const {element} = await renderFieldCondition({
      ifNotDefined: 'author',
      resultState: {raw: {author: 'John Doe'}},
    });

    expect(element?.hidden).toBe(true);
  });

  it('should render its content when a must-match condition is met', async () => {
    const {element, content} = await renderFieldCondition({
      mustMatch: {filetype: ['pdf']},
      resultState: {raw: {filetype: 'pdf'}},
    });

    expect(element?.hidden).toBe(false);
    expect(content).toBeInTheDocument();
  });

  it('should not render its content when a must-match condition is not met', async () => {
    const {element} = await renderFieldCondition({
      mustMatch: {filetype: ['pdf']},
      resultState: {raw: {filetype: 'docx'}},
    });

    expect(element?.hidden).toBe(true);
  });

  it('should render its content when a must-not-match condition is met', async () => {
    const {element, content} = await renderFieldCondition({
      mustNotMatch: {filetype: ['docx']},
      resultState: {raw: {filetype: 'pdf'}},
    });

    expect(element?.hidden).toBe(false);
    expect(content).toBeInTheDocument();
  });

  it('should not render its content when a must-not-match condition is not met', async () => {
    const {element} = await renderFieldCondition({
      mustNotMatch: {filetype: ['docx']},
      resultState: {raw: {filetype: 'docx'}},
    });

    expect(element?.hidden).toBe(true);
  });
});
