import {resolve} from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import {normalizePath, type Plugin, type PluginOption} from 'vite';
import {
  atomicPackageRoot,
  atomicSourceTransformPlugins,
} from '../../atomic/scripts/vite-source-plugins.js';
import {resolveToSource} from './source-mappings.js';

const atomicSrc = normalizePath(resolve(atomicPackageRoot, 'src'));
const atomicTailwindEntry = normalizePath(resolve(atomicSrc, 'utils/tailwind.global.tw.css'));

/**
 * Redirects workspace package specifiers to their source entry points.
 *
 * Serving Atomic and Headless from source is what lets Vite own the whole dependency graph:
 * an edit anywhere in either package invalidates exactly the affected modules, with no
 * intermediate `dist` rebuild to wait on and no filesystem watcher to keep in sync.
 *
 * Storybook does the same thing through its own `externalizeDependencies`, which additionally
 * has to choose between source and CDN depending on the build mode.
 */
const resolveWorkspaceSource = (): Plugin => ({
  name: 'resolve-workspace-source',
  enforce: 'pre',
  resolveId(source) {
    const sourcePath = resolveToSource(source);
    return sourcePath ? {id: sourcePath} : null;
  },
});

/**
 * Points Tailwind's content scanning at Atomic source.
 *
 * `@tailwindcss/vite` infers what to scan from the Vite root, which here holds only the
 * playground's own pages. Components spell out utility classes in their Lit templates and
 * rely on the global sheet `withTailwindStyles` adopts, so without this the `utilities` layer
 * comes out nearly empty and components render unstyled. Storybook and the production build
 * avoid the problem by running from the Atomic package directory, so this stays playground-only.
 */
const scanAtomicSourceForUtilities = (): Plugin => ({
  name: 'scan-atomic-source-for-utilities',
  enforce: 'pre',
  transform(code, id) {
    if (normalizePath(id.split('?')[0]) !== atomicTailwindEntry) {
      return null;
    }
    return {code: `${code}\n@source '${atomicSrc}';\n`, map: null};
  },
});

/**
 * Vite plugins required to run Atomic and Headless from source.
 *
 * Component edits resolve to a full page reload rather than a patch, because
 * `customElements.define` throws on re-registration. Vite reaches that conclusion on its own
 * by walking importers to a dead end, so no explicit HMR boundary is declared here. Theme
 * CSS still hot-updates in place.
 */
export const atomicSourcePlugins = (): PluginOption[] => [
  resolveWorkspaceSource(),
  ...atomicSourceTransformPlugins(),
  scanAtomicSourceForUtilities(),
  tailwindcss(),
];
