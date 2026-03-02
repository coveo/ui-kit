import {main} from '../dist/audit/manual-audit-delta.js';

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
