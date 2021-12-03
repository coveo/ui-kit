import tsPlugin from '@rollup/plugin-typescript';
import licensePlugin from 'rollup-plugin-license';

const typescript = (config) =>
  tsPlugin({tsconfig: './src/tsconfig.build.json', ...config});

const license = () => {
  const banner = `
  Copyright [yyyy] [name of copyright owner]

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
        http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  `
  .replace('[yyyy]', new Date().getFullYear())
  .replace('[name of copyright owner]', 'Coveo Solutions Inc.')

  return licensePlugin({banner});
}

export default {
  input: 'src/auth.ts',
  output: [
    {file: `dist/auth.js`, format: 'cjs'},
    {file: `dist/auth.esm.js`, format: 'es'},
  ],
  plugins: [
    typescript({sourceMap: false}),
    license(),
  ],
};
