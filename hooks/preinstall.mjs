import {execSync} from 'node:child_process';

if (process.platform !== 'win32') {
  process.exit(0);
}
const hasSymlinkGitEnabled =
  execSync('git config --get core.symlinks', {encoding: 'utf8'}).trim() ===
  'true';

if (!hasSymlinkGitEnabled) {
  execSync('git config --local include.path ../.gitconfig');
  try {
    execSync('git checkout');
  } catch (error) {
    console.error(
      'Symlink git support has been enabled in this repository, but automatic checkout has failed. Please run `git checkout` to ensure symlinks are properly set up.'
    );
    process.exit(1);
  }
}
