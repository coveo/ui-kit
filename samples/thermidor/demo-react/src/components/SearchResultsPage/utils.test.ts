import {describe, it, expect} from 'vitest';
import {resolveProductImage, truncate} from './utils.js';
import type {Product} from './utils.js';

describe('resolveProductImage', () => {
  it('returns the first thumbnail when thumbnails exist', () => {
    const product: Product = {
      ec_thumbnails: ['thumb1.jpg', 'thumb2.jpg'],
      ec_images: ['img1.jpg'],
    };
    expect(resolveProductImage(product)).toBe('thumb1.jpg');
  });

  it('falls back to first image when thumbnails are empty', () => {
    const product: Product = {
      ec_thumbnails: [],
      ec_images: ['img1.jpg', 'img2.jpg'],
    };
    expect(resolveProductImage(product)).toBe('img1.jpg');
  });

  it('falls back to first image when thumbnails are undefined', () => {
    const product: Product = {
      ec_images: ['img1.jpg'],
    };
    expect(resolveProductImage(product)).toBe('img1.jpg');
  });

  it('returns null when neither thumbnails nor images exist', () => {
    const product: Product = {};
    expect(resolveProductImage(product)).toBeNull();
  });

  it('returns null when both arrays are empty', () => {
    const product: Product = {
      ec_thumbnails: [],
      ec_images: [],
    };
    expect(resolveProductImage(product)).toBeNull();
  });
});

describe('truncate', () => {
  it('preserves short strings verbatim', () => {
    expect(truncate('hello', 100)).toBe('hello');
  });

  it('preserves strings exactly at the limit', () => {
    const text = 'x'.repeat(100);
    expect(truncate(text, 100)).toBe(text);
  });

  it('truncates strings exceeding the limit with ellipsis', () => {
    const text = 'y'.repeat(101);
    expect(truncate(text, 100)).toBe('y'.repeat(100) + '\u2026');
  });

  it('handles empty string', () => {
    expect(truncate('', 100)).toBe('');
  });
});
