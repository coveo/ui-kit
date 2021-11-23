const fs = require('fs');

const files = fs.readdirSync('dist/atomic/assets');
fs.writeFileSync('docs/assets.json', JSON.stringify({assets: files}));
