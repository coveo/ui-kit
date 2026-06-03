import {describe, expect, it} from 'vitest';
import {ColorParser} from './color-parser';

describe('ColorParser', () => {
  it('should return white for non-rgb input and inverted black', () => {
    const parser = new ColorParser('foo');

    expect(parser.rgb()).toBe('rgb(255, 255, 255)');
    expect(parser.rgbInverted()).toBe('rgb(0, 0, 0)');
    expect(parser.rgbSaturated()).toBe('rgb(255, 255, 255)');
  });

  it('should parse rgb string and invert correctly', () => {
    const parser = new ColorParser('rgb(10,20,30)');

    expect(parser.rgb()).toBe('rgb(10, 20, 30)');
    expect(parser.rgbInverted()).toBe('rgb(245, 235, 225)');
  });

  it('should saturate color by doubling saturation (clamped to 1)', () => {
    const parser = new ColorParser('rgb(100, 150, 200)');

    expect(parser.rgbSaturated()).toBe('rgb(0, 100, 200)');
  });
});
