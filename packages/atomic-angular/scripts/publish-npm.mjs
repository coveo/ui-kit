import {resolve} from 'node:path';

process.env.INIT_CWD = resolve('./projects/atomic-angular/dist');
await import('@coveo/release/npm-publish-package.mjs');
