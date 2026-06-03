import {describe, expect, it} from 'vitest';
import {parseDate, parseTimestampToDateDetails} from './date-utils';

describe('date-utils', () => {
  describe('#parseDate', () => {
    it('should parse valid ISO date string', () => {
      const date = parseDate('2025-09-15');
      expect(date.isValid()).toBe(true);
      expect(date.year()).toBe(2025);
      expect(date.month()).toBe(8); // Months are zero-indexed in dayjs
      expect(date.date()).toBe(15);
    });

    it('should parse date with time', () => {
      const date = parseDate('2025-09-15T10:30:00');
      expect(date.isValid()).toBe(true);
      expect(date.hour()).toBe(10);
      expect(date.minute()).toBe(30);
    });

    it('should parse timestamp number', () => {
      const timestamp = 1726401600000; // 2024-09-15T12:00:00Z
      const date = parseDate(timestamp);
      expect(date.isValid()).toBe(true);
    });

    it('should parse Date object', () => {
      const dateObj = new Date('2025-09-15');
      const date = parseDate(dateObj);
      expect(date.isValid()).toBe(true);
      expect(date.year()).toBe(2025);
    });

    it('should handle invalid date strings', () => {
      const date = parseDate('invalid-date');
      expect(date.isValid()).toBe(false);
    });

    it('should handle null input', () => {
      const date = parseDate(null);
      expect(date.isValid()).toBe(false);
    });

    it('should handle undefined input', () => {
      const date = parseDate(undefined);
      expect(date.isValid()).toBe(true); // dayjs treats undefined as current date/time
    });

    it('should handle empty string', () => {
      const date = parseDate('');
      expect(date.isValid()).toBe(false);
    });
  });

  describe('#parseTimestampToDateDetails', () => {
    it('should parse valid timestamp into date components', () => {
      // Using a known timestamp: January 1, 2024, 12:00:00 UTC
      const timestamp = 1704110400000;
      const details = parseTimestampToDateDetails(timestamp);

      expect(details.year).toBe(2024);
      expect(details.month).toBe('January');
      expect(details.day).toBe(1);
      expect(typeof details.dayOfWeek).toBe('string');
      expect(typeof details.hours).toBe('number');
      expect(typeof details.minutes).toBe('number');
    });

    it('should handle epoch timestamp (0)', () => {
      const details = parseTimestampToDateDetails(0);
      const expectedDate = new Date(0);

      expect(details.year).toBe(expectedDate.getFullYear());
      expect(details.month).toBe(
        [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ][expectedDate.getMonth()]
      );
      expect(details.day).toBe(expectedDate.getDate());
      expect(details.dayOfWeek).toBe(
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][expectedDate.getDay()]
      );
      expect(typeof details.hours).toBe('number');
      expect(typeof details.minutes).toBe('number');
    });

    it('should handle large timestamp values', () => {
      // Year 2050
      const timestamp = 2524608000000;
      const details = parseTimestampToDateDetails(timestamp);
      const expectedDate = new Date(timestamp);

      expect(details.year).toBe(expectedDate.getFullYear());
      expect(typeof details.month).toBe('string');
      expect(typeof details.dayOfWeek).toBe('string');
    });

    it('should return consistent structure for all valid timestamps', () => {
      const timestamp = Date.now();
      const details = parseTimestampToDateDetails(timestamp);

      expect(details).toHaveProperty('year');
      expect(details).toHaveProperty('month');
      expect(details).toHaveProperty('dayOfWeek');
      expect(details).toHaveProperty('day');
      expect(details).toHaveProperty('hours');
      expect(details).toHaveProperty('minutes');
    });

    it('should handle different months correctly', () => {
      // December 25, 2024
      const timestamp = 1735084800000;
      const details = parseTimestampToDateDetails(timestamp);
      const expectedDate = new Date(timestamp);

      expect(details.year).toBe(expectedDate.getFullYear());
      expect(details.month).toBe(
        [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ][expectedDate.getMonth()]
      );
      expect(details.day).toBe(expectedDate.getDate());
    });

    it('should handle invalid timestamp gracefully', () => {
      const details = parseTimestampToDateDetails(NaN);

      expect(Number.isNaN(details.year)).toBe(true);
      expect(details.month).toBeUndefined();
      expect(details.dayOfWeek).toBeUndefined();
      expect(Number.isNaN(details.day)).toBe(true);
      expect(Number.isNaN(details.hours)).toBe(true);
      expect(Number.isNaN(details.minutes)).toBe(true);
    });

    it('should handle negative timestamp values', () => {
      const timestamp = -86400000; // One day before epoch
      const details = parseTimestampToDateDetails(timestamp);
      const expectedDate = new Date(timestamp);

      expect(details.year).toBe(expectedDate.getFullYear());
      expect(details.month).toBe(
        [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ][expectedDate.getMonth()]
      );
      expect(details.day).toBe(expectedDate.getDate());
    });
  });
});
