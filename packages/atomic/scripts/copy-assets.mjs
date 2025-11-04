import {cpSync, mkdirSync} from 'node:fs';

// Copy themes
mkdirSync('dist/atomic/themes', {recursive: true});
cpSync('src/themes', 'dist/atomic/themes', {recursive: true});

// Copy lang files
mkdirSync('dist/atomic/lang', {recursive: true});
cpSync('src/assets/lang', 'dist/atomic/lang', {recursive: true});
