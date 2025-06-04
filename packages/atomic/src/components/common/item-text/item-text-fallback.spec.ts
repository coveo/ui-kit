import {isUndefined} from '@coveo/bueno';
import {html} from 'lit';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {possiblyWarnOnBadFieldType} from './field-warning';
import {ItemTextFallback, ItemTextProps} from './item-text-fallback';

vi.mock('@coveo/bueno', () => ({
  isUndefined: vi.fn(),
}));

vi.mock('./field-warning', () => ({
  possiblyWarnOnBadFieldType: vi.fn(),
}));

describe('ItemTextFallback', () => {
  let props: ItemTextProps<unknown>;
  let mockHost: HTMLElement;
  let mockLogger: Pick<Console, 'error'>;
  let mockGetProperty: ReturnType<typeof vi.fn>;
  let mockIsUndefined: ReturnType<typeof vi.fn>;
  let mockPossiblyWarnOnBadFieldType: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHost = {
      remove: vi.fn(),
    } as unknown as HTMLElement;

    mockLogger = {
      error: vi.fn(),
    };

    mockGetProperty = vi.fn();
    mockIsUndefined = vi.mocked(isUndefined);
    mockPossiblyWarnOnBadFieldType = vi.mocked(possiblyWarnOnBadFieldType);

    props = {
      field: 'testField',
      host: mockHost,
      logger: mockLogger,
      defaultValue: 'default',
      item: {test: 'value'},
      getProperty: mockGetProperty,
    };
  });

  it('should call getProperty with correct parameters', () => {
    mockGetProperty.mockReturnValue('fieldValue');
    mockIsUndefined.mockReturnValue(false);

    const children = html`<span>Test content</span>`;
    ItemTextFallback(props, children);

    expect(mockGetProperty).toHaveBeenCalledWith({test: 'value'}, 'testField');
  });

  it('should call possiblyWarnOnBadFieldType with correct parameters', () => {
    const fieldValue = ['array', 'value'];
    mockGetProperty.mockReturnValue(fieldValue);
    mockIsUndefined.mockReturnValue(false);

    const children = html`<span>Test content</span>`;
    ItemTextFallback(props, children);

    expect(mockPossiblyWarnOnBadFieldType).toHaveBeenCalledWith(
      'testField',
      fieldValue,
      mockHost,
      mockLogger
    );
  });

  it('should return children when defaultValue is defined', () => {
    mockGetProperty.mockReturnValue('fieldValue');
    mockIsUndefined.mockReturnValue(false);

    const children = html`<span>Test content</span>`;
    const result = ItemTextFallback(props, children);

    expect(result).toEqual(html`${children}`);
  });

  it('should remove host and return null when defaultValue is undefined', () => {
    mockGetProperty.mockReturnValue('fieldValue');
    mockIsUndefined.mockReturnValue(true);

    const children = html`<span>Test content</span>`;
    const result = ItemTextFallback(props, children);

    expect(mockHost.remove).toHaveBeenCalled();
    expect(result).toBe(null);
  });

  it('should handle array of children', () => {
    mockGetProperty.mockReturnValue('fieldValue');
    mockIsUndefined.mockReturnValue(false);

    const children = [
      html`<span>First child</span>`,
      html`<span>Second child</span>`,
    ];
    const result = ItemTextFallback(props, children);

    expect(result).toEqual(html`${children}`);
  });

  describe('when defaultValue is undefined', () => {
    beforeEach(() => {
      props.defaultValue = undefined;
      mockIsUndefined.mockReturnValue(true);
    });

    it('should remove host element', () => {
      const children = html`<span>Test content</span>`;
      ItemTextFallback(props, children);

      expect(mockHost.remove).toHaveBeenCalledTimes(1);
    });

    it('should return null', () => {
      const children = html`<span>Test content</span>`;
      const result = ItemTextFallback(props, children);

      expect(result).toBe(null);
    });
  });

  describe('when defaultValue is defined', () => {
    beforeEach(() => {
      mockIsUndefined.mockReturnValue(false);
    });

    it('should not remove host element', () => {
      const children = html`<span>Test content</span>`;
      ItemTextFallback(props, children);

      expect(mockHost.remove).not.toHaveBeenCalled();
    });

    it('should return the provided children', () => {
      const children = html`<span>Test content</span>`;
      const result = ItemTextFallback(props, children);

      expect(result).toEqual(html`${children}`);
    });
  });

  it('should handle different field names', () => {
    const customProps = {
      ...props,
      field: 'customField',
    };
    mockGetProperty.mockReturnValue('customValue');
    mockIsUndefined.mockReturnValue(false);

    const children = html`<span>Test content</span>`;
    ItemTextFallback(customProps, children);

    expect(mockGetProperty).toHaveBeenCalledWith(
      {test: 'value'},
      'customField'
    );
    expect(mockPossiblyWarnOnBadFieldType).toHaveBeenCalledWith(
      'customField',
      'customValue',
      mockHost,
      mockLogger
    );
  });

  it('should handle different item types', () => {
    const customItem = {
      title: 'Custom Title',
      description: 'Custom Description',
    };
    const customProps = {
      ...props,
      item: customItem,
    };
    mockGetProperty.mockReturnValue('title value');
    mockIsUndefined.mockReturnValue(false);

    const children = html`<span>Test content</span>`;
    ItemTextFallback(customProps, children);

    expect(mockGetProperty).toHaveBeenCalledWith(customItem, 'testField');
  });
});
