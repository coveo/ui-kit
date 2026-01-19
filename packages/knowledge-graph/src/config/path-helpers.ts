/**
 * Shared path utilities for package and feature detection
 *
 * Layer 3: ui-kit domain knowledge about directory structure
 */

export type PackageType =
  | 'search'
  | 'commerce'
  | 'insight'
  | 'recommendation'
  | 'case-assist';

/**
 * Determine package from file path
 * @param relativePath - Relative file path from project root
 * @returns Package type
 */
export function getPackageFromPath(relativePath: string): PackageType {
  if (relativePath.includes('/insight/')) return 'insight';
  if (relativePath.includes('/commerce/')) return 'commerce';
  if (relativePath.includes('/recommendation/')) return 'recommendation';
  if (relativePath.includes('/case-assist/')) return 'case-assist';
  return 'search';
}

/**
 * Determine feature from file path
 * @param relativePath - Relative file path from project root
 * @returns Feature name or 'unknown'
 */
export function getFeatureFromPath(relativePath: string): string {
  const featureMatch = relativePath.match(/features\/([^/]+)\//);
  return featureMatch ? featureMatch[1] : 'unknown';
}
