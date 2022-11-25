import {readdirSync, writeFileSync} from 'fs';

const files = readdirSync('dist/atomic/assets');
writeFileSync('docs/assets.json', JSON.stringify({assets: files}));
