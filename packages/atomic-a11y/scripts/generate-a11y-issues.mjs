import {main} from '../dist/audit/generate-a11y-issues.js';

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
