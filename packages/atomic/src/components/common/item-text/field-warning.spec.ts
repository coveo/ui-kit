import {isArray} from '@coveo/bueno';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {possiblyWarnOnBadFieldType} from './field-warning';

vi.mock('@coveo/bueno', {spy: true});

describe('field-warning', () => {
  describe('#possiblyWarnOnBadFieldType', () => {
    let mockHost: HTMLElement;
    let mockLogger: Pick<Console, 'error'>;

    beforeEach(() => {
      mockHost = {
        nodeName: 'ATOMIC-TEXT',
      } as HTMLElement;

      mockLogger = {
        error: vi.fn(),
      };
    });

    it('should log an error when item value is an array', () => {
      const field = 'multiValueField';
      const itemValueRaw = ['value1', 'value2'];
      vi.mocked(isArray).mockReturnValue(true);

      possiblyWarnOnBadFieldType(field, itemValueRaw, mockHost, mockLogger);

      expect(isArray).toHaveBeenCalledWith(itemValueRaw);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'atomic-text cannot be used with multi value field "multiValueField" with values "value1,value2".',
        mockHost
      );
    });

    it('should not log an error when item value is not an array', () => {
      const field = 'singleValueField';
      const itemValueRaw = 'singleValue';
      vi.mocked(isArray).mockReturnValue(false);

      possiblyWarnOnBadFieldType(field, itemValueRaw, mockHost, mockLogger);

      expect(isArray).toHaveBeenCalledWith(itemValueRaw);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});
