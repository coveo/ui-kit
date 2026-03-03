import {main} from '../dist/audit/ai-wcag-audit.js';

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
