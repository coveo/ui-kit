import {isArray} from '@coveo/bueno';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {possiblyWarnOnBadFieldType} from './field-warning';

vi.mock('@coveo/bueno', () => ({
  isArray: vi.fn(),
}));

describe('field-warning', () => {
  describe('#possiblyWarnOnBadFieldType', () => {
    let mockHost: HTMLElement;
    let mockLogger: Pick<Console, 'error'>;
    let mockIsArray: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockHost = {
        nodeName: 'ATOMIC-TEXT',
      } as HTMLElement;

      mockLogger = {
        error: vi.fn(),
      };

      mockIsArray = vi.mocked(isArray);
      vi.clearAllMocks();
    });

    it('should log an error when item value is an array', () => {
      const field = 'multiValueField';
      const itemValueRaw = ['value1', 'value2'];
      mockIsArray.mockReturnValue(true);

      possiblyWarnOnBadFieldType(field, itemValueRaw, mockHost, mockLogger);

      expect(mockIsArray).toHaveBeenCalledWith(itemValueRaw);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'atomic-text cannot be used with multi value field "multiValueField" with values "value1,value2".',
        mockHost
      );
    });

    it('should not log an error when item value is not an array', () => {
      const field = 'singleValueField';
      const itemValueRaw = 'singleValue';
      mockIsArray.mockReturnValue(false);

      possiblyWarnOnBadFieldType(field, itemValueRaw, mockHost, mockLogger);

      expect(mockIsArray).toHaveBeenCalledWith(itemValueRaw);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});
