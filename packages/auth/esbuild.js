const {build} = require('esbuild');

const apacheLicense = () => {
  const license = `
  Copyright [yyyy] [name of copyright owner]

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
        http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.`
    .replace('[yyyy]', new Date().getFullYear())
    .replace('[name of copyright owner]', 'Coveo Solutions Inc.');

  return `/*${license}\n*/`;
};

/**
 * @type {import('esbuild').BuildOptions}
 */
const base = {
  entryPoints: ['src/auth.ts'],
  bundle: true,
  banner: {js: apacheLicense()},
  tsconfig: './src/tsconfig.build.json',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
};

function esm() {
  return build({
    ...base,
    outfile: 'dist/auth.esm.js',
    format: 'esm',
  });
}

function cjs() {
  return build({
    ...base,
    outfile: 'dist/auth.js',
    format: 'cjs',
  });
}

async function main() {
  await Promise.all([esm(), cjs()]);
}

main();
