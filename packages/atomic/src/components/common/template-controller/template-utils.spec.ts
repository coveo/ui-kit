import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {
  makeDefinedConditions,
  makeMatchConditions,
  type TemplateHelpers,
} from './template-utils';

vi.mock('@/src/components/common/layout/sections', {spy: true});
vi.mock('@/src/components/common/layout/item-layout-sections', {spy: true});
vi.mock('@/src/utils/utils', {spy: true});

describe('template-utils', () => {
  describe('makeMatchConditions', () => {
    let consoleErrorSpy: MockInstance;
    let mockHelpers: TemplateHelpers<() => boolean>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockHelpers = {
        fieldMustMatch: vi.fn().mockReturnValue(() => true),
        fieldMustNotMatch: vi.fn().mockReturnValue(() => true),
        fieldsMustBeDefined: vi.fn().mockReturnValue(() => true),
        fieldsMustNotBeDefined: vi.fn().mockReturnValue(() => true),
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('logs a warning and returns an always-false callback when conditions are conflicting', () => {
      const conditions = makeMatchConditions(
        {field: ['value']},
        {field: ['value']},
        mockHelpers
      );
      expect(conditions).toHaveLength(1);
      expect(conditions[0].toString()).toContain('false');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Conflicting match conditions for field field, the template will be ignored.',
        new Set(['value'])
      );
    });

    it('returns both mustMatch and mustNotMatch conditions when provided', () => {
      const mockMustMatchCondition = vi.fn().mockReturnValue(true);
      const mockMustNotMatchCondition = vi.fn().mockReturnValue(false);
      vi.mocked(mockHelpers.fieldMustMatch).mockReturnValue(
        mockMustMatchCondition
      );
      vi.mocked(mockHelpers.fieldMustNotMatch).mockReturnValue(
        mockMustNotMatchCondition
      );

      const conditions = makeMatchConditions(
        {field: ['value1']},
        {field: ['value2']},
        mockHelpers
      );

      expect(conditions).toHaveLength(2);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).toHaveBeenCalledWith(
        'field',
        ['value1']
      );
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).toHaveBeenCalledWith(
        'field',
        ['value2']
      );
      expect(conditions[0]).toBe(mockMustMatchCondition);
      expect(conditions[1]).toBe(mockMustNotMatchCondition);
    });

    it('returns only mustNotMatch conditions when mustMatch is empty', () => {
      const mockCondition = vi.fn().mockReturnValue(false);
      vi.mocked(mockHelpers.fieldMustNotMatch).mockReturnValue(mockCondition);

      const conditions = makeMatchConditions(
        {},
        {field: ['nope']},
        mockHelpers
      );

      expect(conditions).toHaveLength(1);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).not.toHaveBeenCalled();
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).toHaveBeenCalledWith(
        'field',
        ['nope']
      );
      expect(conditions[0]).toBe(mockCondition);
    });

    it('returns only mustMatch conditions when mustNotMatch is empty', () => {
      const mockCondition = vi.fn().mockReturnValue(true);
      vi.mocked(mockHelpers.fieldMustMatch).mockReturnValue(mockCondition);

      const conditions = makeMatchConditions({field: ['yep']}, {}, mockHelpers);

      expect(conditions).toHaveLength(1);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).toHaveBeenCalledWith(
        'field',
        ['yep']
      );
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).not.toHaveBeenCalled();
      expect(conditions[0]).toBe(mockCondition);
    });

    it('returns empty array when both inputs are empty', () => {
      const conditions = makeMatchConditions({}, {}, mockHelpers);

      expect(conditions).toEqual([]);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).not.toHaveBeenCalled();
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).not.toHaveBeenCalled();
    });

    it('calls helpers once per field with correct arguments for multiple fields', () => {
      const mockCondition1 = vi.fn();
      const mockCondition2 = vi.fn();
      const mockCondition3 = vi.fn();
      vi.mocked(mockHelpers.fieldMustMatch).mockReturnValueOnce(mockCondition1);
      vi.mocked(mockHelpers.fieldMustMatch).mockReturnValueOnce(mockCondition2);
      vi.mocked(mockHelpers.fieldMustNotMatch).mockReturnValueOnce(
        mockCondition3
      );

      const conditions = makeMatchConditions(
        {field1: ['value1'], field2: ['value2']},
        {field3: ['value3']},
        mockHelpers
      );

      expect(conditions).toHaveLength(3);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(mockHelpers.fieldMustMatch)).toHaveBeenNthCalledWith(
        1,
        'field1',
        ['value1']
      );
      expect(vi.mocked(mockHelpers.fieldMustMatch)).toHaveBeenNthCalledWith(
        2,
        'field2',
        ['value2']
      );
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(mockHelpers.fieldMustNotMatch)).toHaveBeenCalledWith(
        'field3',
        ['value3']
      );
      expect(conditions).toEqual([
        mockCondition1,
        mockCondition2,
        mockCondition3,
      ]);
    });
  });

  describe('makeDefinedConditions', () => {
    let mockHelpers: TemplateHelpers<() => boolean>;

    beforeEach(() => {
      mockHelpers = {
        fieldMustMatch: vi.fn().mockReturnValue(() => true),
        fieldMustNotMatch: vi.fn().mockReturnValue(() => true),
        fieldsMustBeDefined: vi.fn().mockReturnValue(() => true),
        fieldsMustNotBeDefined: vi.fn().mockReturnValue(() => true),
      };
    });

    it('returns a condition for ifDefined', () => {
      const mockCondition = vi.fn().mockReturnValue(true);
      vi.mocked(mockHelpers.fieldsMustBeDefined).mockReturnValue(mockCondition);

      const conditions = makeDefinedConditions(
        'foo,bar',
        undefined,
        mockHelpers
      );

      expect(conditions).toHaveLength(1);
      expect(vi.mocked(mockHelpers.fieldsMustBeDefined)).toHaveBeenCalledTimes(
        1
      );
      expect(vi.mocked(mockHelpers.fieldsMustBeDefined)).toHaveBeenCalledWith([
        'foo',
        'bar',
      ]);
      expect(
        vi.mocked(mockHelpers.fieldsMustNotBeDefined)
      ).not.toHaveBeenCalled();
      expect(conditions[0]).toBe(mockCondition);
    });

    it('returns a condition for ifNotDefined', () => {
      const mockCondition = vi.fn().mockReturnValue(false);
      vi.mocked(mockHelpers.fieldsMustNotBeDefined).mockReturnValue(
        mockCondition
      );

      const conditions = makeDefinedConditions(undefined, 'baz', mockHelpers);

      expect(conditions).toHaveLength(1);
      expect(
        vi.mocked(mockHelpers.fieldsMustNotBeDefined)
      ).toHaveBeenCalledTimes(1);
      expect(
        vi.mocked(mockHelpers.fieldsMustNotBeDefined)
      ).toHaveBeenCalledWith(['baz']);
      expect(vi.mocked(mockHelpers.fieldsMustBeDefined)).not.toHaveBeenCalled();
      expect(conditions[0]).toBe(mockCondition);
    });

    it('returns both conditions when both args provided', () => {
      const mockDefinedCondition = vi.fn().mockReturnValue(true);
      const mockNotDefinedCondition = vi.fn().mockReturnValue(false);
      vi.mocked(mockHelpers.fieldsMustBeDefined).mockReturnValue(
        mockDefinedCondition
      );
      vi.mocked(mockHelpers.fieldsMustNotBeDefined).mockReturnValue(
        mockNotDefinedCondition
      );

      const conditions = makeDefinedConditions('foo', 'bar', mockHelpers);

      expect(conditions).toHaveLength(2);
      expect(vi.mocked(mockHelpers.fieldsMustBeDefined)).toHaveBeenCalledTimes(
        1
      );
      expect(vi.mocked(mockHelpers.fieldsMustBeDefined)).toHaveBeenCalledWith([
        'foo',
      ]);
      expect(
        vi.mocked(mockHelpers.fieldsMustNotBeDefined)
      ).toHaveBeenCalledTimes(1);
      expect(
        vi.mocked(mockHelpers.fieldsMustNotBeDefined)
      ).toHaveBeenCalledWith(['bar']);
      expect(conditions).toEqual([
        mockDefinedCondition,
        mockNotDefinedCondition,
      ]);
    });

    it('returns empty array when neither arg is provided', () => {
      const conditions = makeDefinedConditions(
        undefined,
        undefined,
        mockHelpers
      );

      expect(conditions).toEqual([]);
      expect(vi.mocked(mockHelpers.fieldsMustBeDefined)).not.toHaveBeenCalled();
      expect(
        vi.mocked(mockHelpers.fieldsMustNotBeDefined)
      ).not.toHaveBeenCalled();
    });
  });
});
