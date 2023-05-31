import {readdirSync, writeFileSync} from 'node:fs';

const files = readdirSync('dist/atomic/assets');
writeFileSync('docs/assets.json', JSON.stringify({assets: files}));
