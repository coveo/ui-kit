import {resolve} from 'node:path';

process.env.INIT_CWD = resolve('./projects/atomic-angular/dist');
await import('@coveo/ci/npm-publish-package.mjs');
