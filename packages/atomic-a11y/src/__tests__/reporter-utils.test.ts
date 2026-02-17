import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  formatDate,
  getAutomationCoveragePercentage,
  getCriterionMetadata,
  type PackageMetadata,
  readPackageMetadata,
} from '../reporter/reporter-utils.js';

vi.mock('node:fs');
vi.mock('../data/criterion-metadata.js');

describe('reporter-utils', () => {
  describe('formatDate()', () => {
    it('should format a date as YYYY-MM-DD', () => {
      const date = new Date('2025-02-17T10:00:00.000Z');
      expect(formatDate(date)).toBe('2025-02-17');
    });

    it('should handle dates at midnight UTC', () => {
      const date = new Date('2000-01-01T00:00:00.000Z');
      expect(formatDate(date)).toBe('2000-01-01');
    });

    it('should handle dates at end of year', () => {
      const date = new Date('2025-12-31T23:59:59.999Z');
      expect(formatDate(date)).toBe('2025-12-31');
    });
  });

  describe('getCriterionMetadata()', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should return metadata for a known criterion', async () => {
      const {getCriterionMetadata: mockLookup} = await import(
        '../data/criterion-metadata.js'
      );
      vi.mocked(mockLookup).mockReturnValue({
        name: 'Contrast (Minimum)',
        level: 'AA',
        wcagVersion: '2.1',
      });

      const result = getCriterionMetadata('1.4.3');
      expect(result).toEqual({
        name: 'Contrast (Minimum)',
        level: 'AA',
        wcagVersion: '2.1',
      });
    });

    it('should return default metadata for unknown criterion', async () => {
      const {getCriterionMetadata: mockLookup} = await import(
        '../data/criterion-metadata.js'
      );
      vi.mocked(mockLookup).mockReturnValue(undefined);

      const result = getCriterionMetadata('9.9.9');
      expect(result).toEqual({
        name: '9.9.9',
        level: 'unknown',
        wcagVersion: 'unknown',
      });
    });

    it('should use criterion ID as fallback name', async () => {
      const {getCriterionMetadata: mockLookup} = await import(
        '../data/criterion-metadata.js'
      );
      vi.mocked(mockLookup).mockReturnValue(undefined);

      const result = getCriterionMetadata('2.1.1');
      expect(result.name).toBe('2.1.1');
    });
  });

  describe('getAutomationCoveragePercentage()', () => {
    it('should calculate coverage as a percentage', () => {
      expect(getAutomationCoveragePercentage(7, 50)).toBe('14%');
    });

    it('should return 0% when covered criteria is zero', () => {
      expect(getAutomationCoveragePercentage(0, 50)).toBe('0%');
    });

    it('should return 100% when all criteria are covered', () => {
      expect(getAutomationCoveragePercentage(50, 50)).toBe('100%');
    });

    it('should handle division by zero gracefully', () => {
      expect(getAutomationCoveragePercentage(1, 0)).toBe('0%');
    });

    it('should round to nearest integer', () => {
      expect(getAutomationCoveragePercentage(1, 3)).toBe('33%');
    });

    it('should round half-way cases correctly', () => {
      expect(getAutomationCoveragePercentage(1, 2)).toBe('50%');
      expect(getAutomationCoveragePercentage(3, 7)).toBe('43%');
    });
  });

  describe('readPackageMetadata()', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should read and parse valid package.json from default path', async () => {
      const {existsSync, readFileSync} = await import('node:fs');
      const mockMetadata: PackageMetadata = {
        version: '1.0.0',
        dependencies: {lit: '^2.0.0'},
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockMetadata));

      const result = readPackageMetadata();
      expect(result).toEqual(mockMetadata);
      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        'utf8'
      );
    });

    it('should read and parse valid package.json from explicit path', async () => {
      const {existsSync, readFileSync} = await import('node:fs');
      const mockMetadata: PackageMetadata = {
        version: '2.0.0',
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockMetadata));

      const result = readPackageMetadata('/custom/path/package.json');
      expect(result).toEqual(mockMetadata);
    });

    it('should throw when package.json does not exist', async () => {
      const {existsSync} = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      expect(() => {
        readPackageMetadata();
      }).toThrow(/package\.json not found/);
    });

    it('should throw when JSON is invalid', async () => {
      const {existsSync, readFileSync} = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('{ invalid json }');

      expect(() => {
        readPackageMetadata();
      }).toThrow(/Invalid JSON/);
    });

    it('should throw when file contains array instead of object', async () => {
      const {existsSync, readFileSync} = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('[]');

      expect(() => {
        readPackageMetadata();
      }).toThrow(/must contain a JSON object/);
    });

    it('should throw when file contains null', async () => {
      const {existsSync, readFileSync} = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('null');

      expect(() => {
        readPackageMetadata();
      }).toThrow(/must contain a JSON object/);
    });

    it('should throw when file contains string', async () => {
      const {existsSync, readFileSync} = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('"string"');

      expect(() => {
        readPackageMetadata();
      }).toThrow(/must contain a JSON object/);
    });

    it('should extract partial metadata from valid package.json', async () => {
      const {existsSync, readFileSync} = await import('node:fs');
      const mockMetadata = {
        name: '@coveo/atomic',
        version: '3.5.0',
        devDependencies: {vitest: '^1.0.0'},
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockMetadata));

      const result = readPackageMetadata();
      expect(result.version).toBe('3.5.0');
      expect(result.devDependencies).toBeDefined();
    });
  });
});
