import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify'
import { terser } from "rollup-plugin-terser";
import serve from 'rollup-plugin-serve'

const tsPlugin = () => typescript({
    useTsconfigDeclarationDir: true
})

const umdConfig = (file) => ({
    file,
    format: 'umd',
    name: 'coveoua',
    sourcemap: true,
})

const umd = {
    input: './src/coveoua/browser.ts',
    output: [
        umdConfig('./dist/coveoua.js'),
        umdConfig('./dist/library.js'),
    ],
    plugins: [
        tsPlugin(),
        uglify(),
        process.env.SERVE ? serve({
            contentBase: ['dist', 'public'],
            port: 9001,
            open: true,
        }) : null
    ]
}


const libraryEsm = {
    input: './src/coveoua/library.ts',
    output: {
        file: './dist/library.es.js',
        format: 'es',
        sourcemap: true
    },
    plugins: [
        tsPlugin(),
        terser()
    ]
}


export default [umd, libraryEsm];