import {describe, expect, it, vi} from 'vitest';
import {isElementNode, isVisualNode} from '@/src/utils/utils';
import {isResultSectionNode} from '../layout/sections';
import {
  getTemplateNodeType,
  makeDefinedConditions,
  makeMatchConditions,
} from './result-template-common';

vi.mock('../layout/sections', {spy: true});
vi.mock('@/src/utils/utils', {spy: true});
vi.mock('@coveo/headless');

describe('result-template-common', () => {
  describe('makeMatchConditions', () => {
    it('returns both mustMatch and mustNotMatch conditions when provided', () => {
      const conditions = makeMatchConditions(
        {field: ['value1']},
        {field: ['value2']}
      );
      expect(conditions).toHaveLength(2);
      expect(typeof conditions[0]).toBe('function');
      expect(typeof conditions[1]).toBe('function');
    });

    it('returns only mustNotMatch conditions when mustMatch is empty', () => {
      const conditions = makeMatchConditions({}, {field: ['nope']});
      expect(conditions).toHaveLength(1);
      expect(typeof conditions[0]).toBe('function');
    });

    it('returns only mustMatch conditions when mustNotMatch is empty', () => {
      const conditions = makeMatchConditions({field: ['yep']}, {});
      expect(conditions).toHaveLength(1);
      expect(typeof conditions[0]).toBe('function');
    });

    it('returns empty array when both inputs are empty', () => {
      const conditions = makeMatchConditions({}, {});
      expect(conditions).toEqual([]);
    });
  });

  describe('makeDefinedConditions', () => {
    it('returns a condition for ifDefined', () => {
      const conditions = makeDefinedConditions('foo,bar', undefined);
      expect(conditions).toHaveLength(1);
      expect(typeof conditions[0]).toBe('function');
    });

    it('returns a condition for ifNotDefined', () => {
      const conditions = makeDefinedConditions(undefined, 'baz');
      expect(conditions).toHaveLength(1);
      expect(typeof conditions[0]).toBe('function');
    });

    it('returns both conditions when both args provided', () => {
      const conditions = makeDefinedConditions('foo', 'bar');
      expect(conditions).toHaveLength(2);
    });

    it('returns empty array when neither arg is provided', () => {
      const conditions = makeDefinedConditions();
      expect(conditions).toEqual([]);
    });
  });

  describe('getTemplateNodeType', () => {
    it('returns "section" when isResultSectionNode is true', () => {
      const node: Node = document.createElement('div');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(true);

      expect(getTemplateNodeType(node)).toBe('section');
    });

    it('returns "metadata" when node is not visual', () => {
      const node: Node = document.createElement('span');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(false);
      vi.mocked(isVisualNode).mockReturnValueOnce(false);

      expect(getTemplateNodeType(node)).toBe('metadata');
    });

    it('returns "table-column-definition" when node matches tableElementTagName', () => {
      const node: Node = document.createElement('atomic-table-element');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(false);
      vi.mocked(isVisualNode).mockReturnValueOnce(true);
      vi.mocked(isElementNode).mockReturnValueOnce(true);

      expect(getTemplateNodeType(node)).toBe('table-column-definition');
    });

    it('returns "other" for any other visual element', () => {
      const node: Node = document.createElement('p');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(false);
      vi.mocked(isVisualNode).mockReturnValueOnce(true);
      vi.mocked(isElementNode).mockReturnValueOnce(false);

      expect(getTemplateNodeType(node)).toBe('other');
    });
  });
});
