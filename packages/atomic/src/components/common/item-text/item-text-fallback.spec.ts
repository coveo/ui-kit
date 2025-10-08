import {isUndefined} from '@coveo/bueno';
import {html, nothing} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {type ItemTextProps, renderItemTextFallback} from './item-text-fallback';

vi.mock('@coveo/bueno', {spy: true});
vi.mock('./field-warning', {spy: true});

describe('#renderItemTextFallback', () => {
  let props: ItemTextProps<unknown>;
  let mockHost: HTMLElement;
  let mockLogger: Pick<Console, 'error'>;
  let mockGetProperty: ReturnType<typeof vi.fn>;
  let mockIsUndefined: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHost = {
      remove: vi.fn(),
    } as unknown as HTMLElement;

    mockLogger = {
      error: vi.fn(),
    };

    mockGetProperty = vi.fn();
    mockIsUndefined = vi.mocked(isUndefined);

    props = {
      field: 'testField',
      host: mockHost,
      logger: mockLogger,
      defaultValue: 'default',
      item: {test: 'value'},
      getProperty: mockGetProperty,
    };
  });

  it('should return children when defaultValue is defined', () => {
    mockGetProperty.mockReturnValue('fieldValue');
    mockIsUndefined.mockReturnValue(false);

    const children = html`<span>Test content</span>`;
    const result = renderItemTextFallback({props})(children);

    expect(result).toEqual(html`${children}`);
  });

  it('should remove host and return nothing when defaultValue is undefined', () => {
    mockGetProperty.mockReturnValue('fieldValue');
    mockIsUndefined.mockReturnValue(true);

    const children = html`<span>Test content</span>`;
    const result = renderItemTextFallback({props})(children);

    expect(mockHost.remove).toHaveBeenCalled();
    expect(result).toBe(nothing);
  });

  it('should handle array of children', () => {
    mockGetProperty.mockReturnValue('fieldValue');
    mockIsUndefined.mockReturnValue(false);

    const children = [
      html`<span>First child</span>`,
      html`<span>Second child</span>`,
    ];
    const result = renderItemTextFallback({props})(children);

    expect(result).toEqual(html`${children}`);
  });

  describe('when defaultValue is undefined', () => {
    beforeEach(() => {
      props.defaultValue = undefined;
      mockIsUndefined.mockReturnValue(true);
    });

    it('should remove host element', () => {
      const children = html`<span>Test content</span>`;
      renderItemTextFallback({props})(children);

      expect(mockHost.remove).toHaveBeenCalledTimes(1);
    });

    it('should return nothing', () => {
      const children = html`<span>Test content</span>`;
      const result = renderItemTextFallback({props})(children);

      expect(result).toBe(nothing);
    });
  });

  describe('when defaultValue is defined', () => {
    beforeEach(() => {
      mockIsUndefined.mockReturnValue(false);
    });

    it('should not remove host element', () => {
      const children = html`<span>Test content</span>`;
      renderItemTextFallback({props})(children);

      expect(mockHost.remove).not.toHaveBeenCalled();
    });

    it('should return the provided children', () => {
      const children = html`<span>Test content</span>`;
      const result = renderItemTextFallback({props})(children);

      expect(result).toEqual(html`${children}`);
    });
  });
});
