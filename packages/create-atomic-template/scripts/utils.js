const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.ps1' : ''}`;

const DEFAULT_PACKAGE_MANAGER = 'npm';

function getPackageManager(noCmd = false) {
  const firstUserAgent = /^\w+(?=\/)/;
  const packageManager =
    process.env['npm_config_user_agent'].match(firstUserAgent) ??
    DEFAULT_PACKAGE_MANAGER;
  return noCmd ? packageManager : appendCmdIfWindows(packageManager);
}

module.exports = {getPackageManager};
