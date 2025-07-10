import {describe, expect, it} from 'vitest';
import {
  getFirstBreadcrumbValue,
  joinBreadcrumbValues,
} from './breadcrumb-utils';

describe('#joinBreadcrumbValues', () => {
  const breadcrumb = {
    formattedValue: ['value1', 'value2', 'value3'],
    label: 'Test Label',
    state: 'idle' as const,
    facetId: 'test-facet',
    deselect: () => {},
  };

  it('should join formatted values with a separator', () => {
    const result = joinBreadcrumbValues(breadcrumb);
    expect(result).toBe('value1 / value2 / value3');
  });

  it('should return a single value if formattedValue is not an array', () => {
    const singleValueBreadcrumb = {
      ...breadcrumb,
      formattedValue: ['Single Value'],
    };
    const result = joinBreadcrumbValues(singleValueBreadcrumb);
    expect(result).toBe('Single Value');
  });
});

describe('#getFirstBreadcrumbValue', () => {
  const breadcrumb = {
    formattedValue: ['value1', 'value2', 'value3'],
    label: 'Test Label',
    state: 'idle' as const,
    facetId: 'test-facet',
    deselect: () => {},
  };

  it('should return the first value when formattedValue is an array', () => {
    const result = getFirstBreadcrumbValue(breadcrumb, 3);
    expect(result).toBe('value1 / value2 / value3');
  });

  it('should return a single value when formattedValue is not an array', () => {
    const singleValueBreadcrumb = {
      ...breadcrumb,
      formattedValue: ['Single Value'],
    };
    const result = getFirstBreadcrumbValue(singleValueBreadcrumb, 3);
    expect(result).toBe('Single Value');
  });

  it('should limit the path if it exceeds the specified limit', () => {
    const longBreadcrumb = {
      ...breadcrumb,
      formattedValue: ['value1', 'value2', 'value3', 'value4'],
    };
    const result = getFirstBreadcrumbValue(longBreadcrumb, 2);
    expect(result).toBe('value1 / ... / value4');
  });
});
