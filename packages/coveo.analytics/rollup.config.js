import typescript from 'rollup-plugin-typescript2';
import {uglify} from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';

const tsPlugin = () =>
    typescript({
        useTsconfigDeclarationDir: true,
    });

const umdConfig = {
    format: 'umd',
    name: 'coveoua',
};

const browser = {
    input: './src/coveoua/browser.ts',
    output: [
        {
            ...umdConfig,
            file: './dist/coveoua.js',
            sourcemap: true,
        },
    ],
    plugins: [
        tsPlugin(),
        uglify(),
        process.env.SERVE
            ? serve({
                  contentBase: ['dist', 'public'],
                  port: 9001,
                  open: true,
                  headers: {
                      'Access-Control-Allow-Origin': 'http://localhost:9001',
                  },
              })
            : null,
    ],
};

const libUMD = {
    input: './src/coveoua/library.ts',
    output: [
        {
            ...umdConfig,
            file: './dist/library.js',
        },
    ],
    plugins: [tsPlugin()],
};

const libESM = {
    input: './src/coveoua/headless.ts',
    output: {
        file: './dist/library.es.js',
        format: 'es',
    },
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {compilerOptions: {target: 'es6'}},
        }),
    ],
};

const libRN = {
    input: './src/react-native/index.ts',
    output: {
        file: './dist/react-native.es.js',
        format: 'es',
    },
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {compilerOptions: {target: 'es6'}},
        }),
    ],
};

export default [browser, libUMD, libESM, libRN];
