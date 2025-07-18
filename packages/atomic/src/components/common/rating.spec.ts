import {within} from '@storybook/test';
import type {i18n} from 'i18next';
import {html, render} from 'lit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {FieldValueIsNaNError} from '../commerce/product-template-component-utils/error';
import {computeNumberOfStars, renderRating, type RatingProps} from './rating';

describe('renderRating', () => {
  let container: HTMLElement;
  let mockI18n: i18n;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockI18n = await createTestI18n();
    
    // Mock the i18n.t function to return a predictable string
    vi.spyOn(mockI18n, 't').mockImplementation((key: string, options?: any) => {
      if (key === 'stars') {
        return `${options?.count} stars out of ${options?.max}`;
      }
      return key;
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  const renderComponent = (props: Partial<RatingProps>) => {
    const defaultProps: RatingProps = {
      i18n: mockI18n,
      numberOfTotalIcons: 5,
      numberOfActiveIcons: 3,
      icon: 'star-icon',
      iconSize: 0.75,
      ...props,
    };

    render(
      html`${renderRating({props: defaultProps})}`,
      container
    );

    return within(container).getByRole('img');
  };

  it('should render a rating component in the document', () => {
    const ratingElement = renderComponent({});
    expect(ratingElement).toBeInTheDocument();
  });

  it('should render with correct aria-label', () => {
    const ratingElement = renderComponent({
      numberOfActiveIcons: 4,
      numberOfTotalIcons: 5,
    });
    
    expect(ratingElement).toHaveAttribute('aria-label', '4 stars out of 5');
    expect(mockI18n.t).toHaveBeenCalledWith('stars', {
      count: 4,
      max: 5,
    });
  });

  it('should render the correct number of total icons', () => {
    renderComponent({numberOfTotalIcons: 7});
    
    const emptyIcons = container.querySelectorAll('.z-0 atomic-icon');
    const filledIcons = container.querySelectorAll('.z-1 atomic-icon');
    
    expect(emptyIcons).toHaveLength(7);
    expect(filledIcons).toHaveLength(7);
  });

  it('should apply the correct icon attribute', () => {
    const customIcon = 'custom-star-icon';
    renderComponent({icon: customIcon});
    
    const icons = container.querySelectorAll('atomic-icon');
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('icon', customIcon);
    });
  });

  it('should apply correct CSS classes to active and inactive icons', () => {
    renderComponent({});
    
    const emptyIcons = container.querySelectorAll('.z-0 atomic-icon');
    const filledIcons = container.querySelectorAll('.z-1 atomic-icon');
    
    emptyIcons.forEach(icon => {
      expect(icon).toHaveClass('icon-inactive');
      expect(icon).not.toHaveClass('icon-active');
    });
    
    filledIcons.forEach(icon => {
      expect(icon).toHaveClass('icon-active');
      expect(icon).not.toHaveClass('icon-inactive');
    });
  });

  it('should apply the correct part attribute to the rating container', () => {
    const ratingElement = renderComponent({});
    expect(ratingElement).toHaveAttribute('part', 'value-rating');
  });

  it('should apply the correct part attribute to icons', () => {
    renderComponent({});
    
    const icons = container.querySelectorAll('atomic-icon');
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('part', 'value-rating-icon');
    });
  });

  it('should have the correct DOM structure', () => {
    renderComponent({});
    
    const ratingContainer = container.querySelector('[part="value-rating"]');
    expect(ratingContainer).toBeInTheDocument();
    expect(ratingContainer).toHaveClass('relative', 'w-max');
    
    const emptyContainer = container.querySelector('.z-0');
    expect(emptyContainer).toBeInTheDocument();
    expect(emptyContainer).toHaveClass('flex', 'gap-0.5');
    
    const filledContainer = container.querySelector('.z-1');
    expect(filledContainer).toBeInTheDocument();
    expect(filledContainer).toHaveClass('absolute', 'top-0', 'left-0', 'z-1', 'flex', 'gap-0.5', 'overflow-hidden');
  });

  it('should render icons with shrink-0 class', () => {
    renderComponent({});
    
    const icons = container.querySelectorAll('atomic-icon');
    icons.forEach(icon => {
      expect(icon).toHaveClass('shrink-0');
    });
  });

  it('should render with different icon counts', () => {
    renderComponent({numberOfTotalIcons: 3});
    
    const emptyIcons = container.querySelectorAll('.z-0 atomic-icon');
    const filledIcons = container.querySelectorAll('.z-1 atomic-icon');
    
    expect(emptyIcons).toHaveLength(3);
    expect(filledIcons).toHaveLength(3);
  });

  it('should render with large icon counts', () => {
    renderComponent({numberOfTotalIcons: 10});
    
    const emptyIcons = container.querySelectorAll('.z-0 atomic-icon');
    const filledIcons = container.querySelectorAll('.z-1 atomic-icon');
    
    expect(emptyIcons).toHaveLength(10);
    expect(filledIcons).toHaveLength(10);
  });
});

describe('computeNumberOfStars', () => {
  it('should return null when value is null', () => {
    const result = computeNumberOfStars(null, 'test-field');
    expect(result).toBeNull();
  });

  it('should parse and return a valid number', () => {
    const result = computeNumberOfStars(4.5, 'test-field');
    expect(result).toBe(4.5);
  });

  it('should parse string numbers', () => {
    const result = computeNumberOfStars('3.7', 'test-field');
    expect(result).toBe(3.7);
  });

  it('should parse integer numbers', () => {
    const result = computeNumberOfStars(4, 'test-field');
    expect(result).toBe(4);
  });

  it('should handle zero', () => {
    const result = computeNumberOfStars(0, 'test-field');
    expect(result).toBe(0);
  });

  it('should handle negative numbers', () => {
    const result = computeNumberOfStars(-1.5, 'test-field');
    expect(result).toBe(-1.5);
  });

  it('should throw FieldValueIsNaNError for invalid string values', () => {
    expect(() => computeNumberOfStars('invalid', 'test-field')).toThrow(
      FieldValueIsNaNError
    );
  });

  it('should throw FieldValueIsNaNError for undefined values', () => {
    expect(() => computeNumberOfStars(undefined, 'test-field')).toThrow(
      FieldValueIsNaNError
    );
  });

  it('should throw FieldValueIsNaNError for object values', () => {
    expect(() => computeNumberOfStars({}, 'test-field')).toThrow(
      FieldValueIsNaNError
    );
  });

  it('should throw FieldValueIsNaNError for array values', () => {
    expect(() => computeNumberOfStars([], 'test-field')).toThrow(
      FieldValueIsNaNError
    );
  });

  it('should include the field name and value in the error message', () => {
    try {
      computeNumberOfStars('invalid-value', 'rating-field');
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(FieldValueIsNaNError);
      expect(error.message).toContain('rating-field');
      expect(error.message).toContain('invalid-value');
    }
  });

  it('should handle very large numbers', () => {
    const result = computeNumberOfStars(999999.99, 'test-field');
    expect(result).toBe(999999.99);
  });

  it('should handle very small decimal numbers', () => {
    const result = computeNumberOfStars(0.0001, 'test-field');
    expect(result).toBe(0.0001);
  });

  it('should handle scientific notation strings', () => {
    const result = computeNumberOfStars('1e5', 'test-field');
    expect(result).toBe(100000);
  });

  it('should handle string with leading/trailing whitespace', () => {
    const result = computeNumberOfStars('  4.5  ', 'test-field');
    expect(result).toBe(4.5);
  });
});