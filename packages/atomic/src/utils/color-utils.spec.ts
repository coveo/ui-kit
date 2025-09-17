import {describe, expect, it} from 'vitest';
import {hsvToRgb, rgbToHsv} from './color-utils';

describe('color-utils', () => {
  describe('#rgbToHsv', () => {
    it('should convert primary colors correctly', () => {
      // Red
      const red = rgbToHsv(255, 0, 0);
      expect(red).toEqual({h: 0, s: 1, v: 255});

      // Green
      const green = rgbToHsv(0, 255, 0);
      expect(green.h).toBeCloseTo(1 / 3, 5);
      expect(green.s).toBe(1);
      expect(green.v).toBe(255);

      // Blue
      const blue = rgbToHsv(0, 0, 255);
      expect(blue.h).toBeCloseTo(2 / 3, 5);
      expect(blue.s).toBe(1);
      expect(blue.v).toBe(255);
    });

    it('should handle grayscale colors', () => {
      // Black
      const black = rgbToHsv(0, 0, 0);
      expect(black).toEqual({h: 0, s: 0, v: 0});

      // White
      const white = rgbToHsv(255, 255, 255);
      expect(white).toEqual({h: 0, s: 0, v: 255});

      // Gray
      const gray = rgbToHsv(128, 128, 128);
      expect(gray).toEqual({h: 0, s: 0, v: 128});
    });

    it('should handle mixed colors correctly', () => {
      // Purple (magenta)
      const purple = rgbToHsv(255, 0, 255);
      expect(purple.h).toBeCloseTo(5 / 6, 5);
      expect(purple.s).toBe(1);
      expect(purple.v).toBe(255);

      // Yellow
      const yellow = rgbToHsv(255, 255, 0);
      expect(yellow.h).toBeCloseTo(1 / 6, 5);
      expect(yellow.s).toBe(1);
      expect(yellow.v).toBe(255);

      // Cyan
      const cyan = rgbToHsv(0, 255, 255);
      expect(cyan.h).toBeCloseTo(0.5, 5);
      expect(cyan.s).toBe(1);
      expect(cyan.v).toBe(255);
    });

    it('should handle decimal input values', () => {
      const result = rgbToHsv(127.5, 63.75, 191.25);
      expect(typeof result.h).toBe('number');
      expect(typeof result.s).toBe('number');
      expect(typeof result.v).toBe('number');
      expect(result.h).toBeGreaterThanOrEqual(0);
      expect(result.h).toBeLessThanOrEqual(1);
      expect(result.s).toBeGreaterThanOrEqual(0);
      expect(result.s).toBeLessThanOrEqual(1);
    });

    it('should maintain mathematical properties', () => {
      // When max === min, saturation should be 0
      const equalValues = rgbToHsv(100, 100, 100);
      expect(equalValues.s).toBe(0);
      expect(equalValues.h).toBe(0);
      expect(equalValues.v).toBe(100);
    });
  });

  describe('#hsvToRgb', () => {
    it('should convert HSV primary colors to RGB correctly', () => {
      // Red (h=0)
      const red = hsvToRgb(0, 1, 255);
      expect(red).toEqual({r: 255, g: 0, b: 0});

      // Green (h=1/3)
      const green = hsvToRgb(1 / 3, 1, 255);
      expect(green).toEqual({r: 0, g: 255, b: 0});

      // Blue (h=2/3)
      const blue = hsvToRgb(2 / 3, 1, 255);
      expect(blue).toEqual({r: 0, g: 0, b: 255});
    });

    it('should handle grayscale conversions', () => {
      // Black
      const black = hsvToRgb(0, 0, 0);
      expect(black).toEqual({r: 0, g: 0, b: 0});

      // White
      const white = hsvToRgb(0, 0, 255);
      expect(white).toEqual({r: 255, g: 255, b: 255});

      // Gray (any hue with 0 saturation)
      const gray = hsvToRgb(0.5, 0, 128);
      expect(gray).toEqual({r: 128, g: 128, b: 128});
    });

    it('should handle secondary colors correctly', () => {
      // Yellow (h=1/6)
      const yellow = hsvToRgb(1 / 6, 1, 255);
      expect(yellow).toEqual({r: 255, g: 255, b: 0});

      // Magenta (h=5/6)
      const magenta = hsvToRgb(5 / 6, 1, 255);
      expect(magenta).toEqual({r: 255, g: 0, b: 255});

      // Cyan (h=1/2)
      const cyan = hsvToRgb(0.5, 1, 255);
      expect(cyan).toEqual({r: 0, g: 255, b: 255});
    });

    it('should handle boundary values', () => {
      // Maximum hue (should wrap around)
      const maxHue = hsvToRgb(1, 1, 255);
      expect(maxHue).toEqual({r: 255, g: 0, b: 0});
    });

    it('should handle different saturation levels', () => {
      // Full saturation
      const fullSat = hsvToRgb(0, 1, 255);
      expect(fullSat).toEqual({r: 255, g: 0, b: 0});

      // Half saturation
      const halfSat = hsvToRgb(0, 0.5, 255);
      expect(halfSat).toEqual({r: 255, g: 128, b: 128});

      // No saturation
      const noSat = hsvToRgb(0, 0, 255);
      expect(noSat).toEqual({r: 255, g: 255, b: 255});
    });

    it('should handle different value levels', () => {
      // Full value
      const fullValue = hsvToRgb(0, 1, 255);
      expect(fullValue).toEqual({r: 255, g: 0, b: 0});

      // Half value
      const halfValue = hsvToRgb(0, 1, 127.5);
      expect(halfValue).toEqual({r: 128, g: 0, b: 0});

      // Zero value
      const zeroValue = hsvToRgb(0, 1, 0);
      expect(zeroValue).toEqual({r: 0, g: 0, b: 0});
    });

    it('should return rounded integer values', () => {
      const result = hsvToRgb(0.1, 0.7, 200.8);
      expect(Number.isInteger(result.r)).toBe(true);
      expect(Number.isInteger(result.g)).toBe(true);
      expect(Number.isInteger(result.b)).toBe(true);
    });

    it('should handle all six sectors of the color wheel', () => {
      // Test each sector (i % 6) in the switch statement
      const sectors = [
        {h: 0 / 6, expected: 'red-like'}, // sector 0
        {h: 1 / 6, expected: 'yellow-like'}, // sector 1
        {h: 2 / 6, expected: 'green-like'}, // sector 2
        {h: 3 / 6, expected: 'cyan-like'}, // sector 3
        {h: 4 / 6, expected: 'blue-like'}, // sector 4
        {h: 5 / 6, expected: 'magenta-like'}, // sector 5
      ];

      sectors.forEach(({h}) => {
        const result = hsvToRgb(h, 1, 255);
        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
      });
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain consistency for RGB→HSV→RGB conversions', () => {
      const testColors = [
        {r: 255, g: 0, b: 0}, // Red
        {r: 0, g: 255, b: 0}, // Green
        {r: 0, g: 0, b: 255}, // Blue
        {r: 255, g: 255, b: 0}, // Yellow
        {r: 255, g: 0, b: 255}, // Magenta
        {r: 0, g: 255, b: 255}, // Cyan
        {r: 128, g: 128, b: 128}, // Gray
        {r: 200, g: 150, b: 100}, // Brown-ish
      ];

      testColors.forEach(({r, g, b}) => {
        const hsv = rgbToHsv(r, g, b);
        const backToRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

        expect(backToRgb.r).toBe(r);
        expect(backToRgb.g).toBe(g);
        expect(backToRgb.b).toBe(b);
      });
    });

    it('should maintain consistency for HSV→RGB→HSV conversions', () => {
      const testColors = [
        {h: 0, s: 1, v: 255}, // Red
        {h: 1 / 3, s: 1, v: 255}, // Green
        {h: 2 / 3, s: 1, v: 255}, // Blue
        {h: 0.5, s: 0.5, v: 200}, // Medium cyan
        {h: 0.8, s: 0.7, v: 150}, // Purple-ish
      ];

      testColors.forEach(({h, s, v}) => {
        const rgb = hsvToRgb(h, s, v);
        const backToHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

        // Use approximate equality for floating point comparisons
        expect(backToHsv.h).toBeCloseTo(h, 5);
        expect(backToHsv.s).toBeCloseTo(s, 5);
        expect(backToHsv.v).toBeCloseTo(v, 5);
      });
    });
  });
});
