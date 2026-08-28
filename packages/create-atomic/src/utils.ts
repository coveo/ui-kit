export const appendCmdIfWindows = (cmd: string) =>
  `${cmd}${process.platform === 'win32' ? '.ps1' : ''}`;

const STENCIL_BIN = './node_modules/@stencil/core/bin/stencil';

/**
 * Stencil transpiles `stencil.config.ts` to a `.js` file inside the project, which has no
 * `"type": "module"` in its `package.json`. Node only detects the ES module syntax in such
 * ambiguous files by default as of 20.19.0 and 22.7.0; on older versions the file is treated as
 * CommonJS and the build fails with an ES module error. Those versions need
 * `--experimental-detect-module`, which exists as of 20.10.0 and 21.1.0.
 *
 * @see https://nodejs.org/en/blog/release/v20.19.0#module-syntax-detection-is-now-enabled-by-default
 */
export function needsModuleDetectionFlag(nodeVersion = process.versions.node) {
  const [major, minor] = nodeVersion.split('.').map(Number);

  switch (major) {
    case 20:
      return minor >= 10 && minor < 19;
    case 21:
      return minor >= 1;
    case 22:
      return minor < 7;
    default:
      return false;
  }
}

/**
 * The command the generated project uses to invoke Stencil, adapted to the Node version the
 * project is scaffolded with.
 */
export function getStencilCommand(nodeVersion = process.versions.node) {
  return needsModuleDetectionFlag(nodeVersion)
    ? `node --experimental-detect-module ${STENCIL_BIN}`
    : 'stencil';
}

const DEFAULT_PACKAGE_MANAGER = 'npm';

export function getPackageManager(noCmd = false) {
  const firstUserAgent = /^\w+(?=\/)/;
  const packageManager =
    process.env.npm_config_user_agent?.match(firstUserAgent)?.[0] ?? DEFAULT_PACKAGE_MANAGER;
  return noCmd ? packageManager : appendCmdIfWindows(packageManager);
}
