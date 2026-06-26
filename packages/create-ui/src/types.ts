/**
 * Minimal shape of the parts of a `package.json` we read or rewrite while
 * scaffolding. Unknown fields are preserved through the index signature.
 */
export interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: unknown;
}
