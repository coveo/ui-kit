import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',

  output: [
    {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      exports: 'named',
      footer: 'module.exports = Object.assign(exports.default, exports);',
      sourcemap: true,
    },
    {
      file: './dist/es/index.js',
      format: 'es',
      sourcemap: true,
      plugins: [emitModulePackageFile()],
    },
  ],
  plugins: [typescript({sourceMap: true})],
};

export function emitModulePackageFile() {
  return {
    name: 'emit-module-package-file',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: `{"type":"module"}`,
      });
    },
  };
}
