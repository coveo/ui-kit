import {execSync, spawn} from 'child_process';
import chalk from 'chalk';

const main = async () => {
 
  console.log(
     // eslint-disable-next-line @cspell/spellchecker
    chalk.cyan('Starting workspace server on port 3000 for ./dist/proda/StaticCDN directory...')
  );
 // eslint-disable-next-line @cspell/spellchecker
 spawn('npx', ['ws', '--port', '3000', '-d', 'dist/proda/StaticCDN'], {
    stdio: 'inherit',
  });
};

main().catch((err) => {
  console.error(chalk.red('An error occurred:'), err);
  process.exit(1);
});
