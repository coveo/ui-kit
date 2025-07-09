import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from 'vitest';
import {isElementNode, isVisualNode} from '@/src/utils/utils';
import {isResultSectionNode} from '../layout/sections';
import {
  getTemplateNodeType,
  makeDefinedConditions,
  makeMatchConditions,
} from './product-template-common';

vi.mock('../layout/sections', {spy: true});
vi.mock('@/src/utils/utils', {spy: true});
vi.mock('@coveo/headless/commerce');

describe('utils', () => {
  describe('makeMatchConditions', () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should log a warning and return an always-false callback when conditions are conflicting', () => {
      const conditions = makeMatchConditions(
        {field: ['value']},
        {field: ['value']}
      );
      expect(conditions).toHaveLength(1);
      expect(conditions[0].toString()).toMatchSnapshot();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy.mock.calls[0]).toMatchSnapshot();
    });

    it('should return a mustMatch and a mustNotMatch condition when no conflict', () => {
      const conditions = makeMatchConditions(
        {field: ['value1']},
        {field: ['value2']}
      );
      expect(conditions.length).toBe(2);
      expect(typeof conditions[0]).toBe('function');
      expect(typeof conditions[1]).toBe('function');
    });

    it('should return only mustNotMatch conditions if mustMatch is empty', () => {
      const conditions = makeMatchConditions({}, {field: ['value2']});
      expect(conditions.length).toBe(1);
      expect(typeof conditions[0]).toBe('function');
    });

    it('should return only mustMatch conditions if mustNotMatch is empty', () => {
      const conditions = makeMatchConditions({field: ['value1']}, {});
      expect(conditions.length).toBe(1);
      expect(typeof conditions[0]).toBe('function');
    });
  });

  describe('makeDefinedConditions', () => {
    it('should return a condition for ifDefined', () => {
      const conditions = makeDefinedConditions('foo,bar', undefined);
      expect(conditions.length).toBe(1);
      expect(typeof conditions[0]).toBe('function');
    });

    it('should return a condition for ifNotDefined', () => {
      const conditions = makeDefinedConditions(undefined, 'baz');
      expect(conditions.length).toBe(1);
      expect(typeof conditions[0]).toBe('function');
    });

    it('should return two conditions for both ifDefined and ifNotDefined', () => {
      const conditions = makeDefinedConditions('foo', 'bar');
      expect(conditions.length).toBe(2);
      expect(typeof conditions[0]).toBe('function');
      expect(typeof conditions[1]).toBe('function');
    });

    it('should return an empty array if neither is provided', () => {
      const conditions = makeDefinedConditions();
      expect(conditions.length).toBe(0);
    });
  });

  describe('getTemplateNodeType', () => {
    it('should return "section" for a node with isResultSectionNode true', () => {
      const node: Node = document.createElement('anything');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(true);
      expect(getTemplateNodeType(node)).toBe('section');
    });

    it('should return "metadata" for a node that is not visual', () => {
      const node: Node = document.createElement('anything');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(false);
      vi.mocked(isVisualNode).mockReturnValueOnce(false); // dsa
      expect(getTemplateNodeType(node)).toBe('metadata');
    });

    it('should return "table-column-definition" for a table element', () => {
      const node: Node = document.createElement('atomic-table-element');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(false);
      vi.mocked(isVisualNode).mockReturnValueOnce(true);
      vi.mocked(isElementNode).mockReturnValueOnce(true);
      expect(getTemplateNodeType(node)).toBe('table-column-definition');
    });

    it('should return "other" for any other node', () => {
      const node: Node = document.createElement('anything');
      vi.mocked(isResultSectionNode).mockReturnValueOnce(false);
      vi.mocked(isVisualNode).mockReturnValueOnce(true);
      vi.mocked(isElementNode).mockReturnValueOnce(false);
      expect(getTemplateNodeType(node)).toBe('other');
    });
  });
});
