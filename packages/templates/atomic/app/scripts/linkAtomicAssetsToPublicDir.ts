/**
 * Links Atomic static assets (language files and assets) to the public directory via symbolic links.
 *
 * This function creates symbolic links from the @coveo/atomic package's language and asset directories
 * to the corresponding directories in the public folder. This allows Vite to serve Atomic's
 * static resources without duplicating files.
 *
 * The function will:
 * - Remove any existing public/atomic directory
 * - Create a new public/atomic directory structure
 * - Create symbolic links to @coveo/atomic's language files at public/atomic/lang
 * - Create symbolic links to @coveo/atomic's assets at public/atomic/assets
 *
 * @example
 * ```typescript
 * // Call during build process to set up asset links
 * linkAtomicStaticAssetsToPublicDir();
 * ```
 *
 * You do not need/should not call this function if you load the Atomic package via a CDN, as the assets will be served directly from there.
 *
 * @throws {Error} Throws if symbolic link creation fails or if @coveo/atomic package is not found
 */
import {symlinkSync, mkdirSync, rmSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

export function linkAtomicStaticAssetsToPublicDir() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const publicAtomicPath = resolve(__dirname, '../public/atomic');

  const atomicLanguagePath = dirname(
    fileURLToPath(import.meta.resolve('@coveo/atomic/lang/index.js'))
  );
  const publicLanguagePath = resolve(__dirname, publicAtomicPath, 'lang');
  const atomicAssetsPath = dirname(
    fileURLToPath(import.meta.resolve('@coveo/atomic/assets/index.js'))
  );
  const publicAssetsPath = resolve(__dirname, publicAtomicPath, 'assets');

  rmSync(publicAtomicPath, {recursive: true, force: true});
  mkdirSync(publicAtomicPath, {recursive: true});
  symlinkSync(atomicAssetsPath, publicAssetsPath, 'dir');
  symlinkSync(atomicLanguagePath, publicLanguagePath, 'dir');
}
