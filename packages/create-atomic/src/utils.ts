export const appendCmdIfWindows = (cmd: string) =>
  `${cmd}${process.platform === 'win32' ? '.ps1' : ''}`;

const DEFAULT_PACKAGE_MANAGER = 'npm';

export function getPackageManager(noCmd = false) {
  const firstUserAgent = /^\w+(?=\/)/;
  const packageManager =
    process.env.npm_config_user_agent?.match(firstUserAgent)?.[0] ??
    DEFAULT_PACKAGE_MANAGER;
  return noCmd ? packageManager : appendCmdIfWindows(packageManager);
}
