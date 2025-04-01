import {context} from 'esbuild';

/**
 * @param {import('esbuild').BuildOptions} options
 */
export async function build(options) {
  const {watch, ...allOtherOptions} = options;
  const esBuildContext = await context(allOtherOptions);
  const output = await esBuildContext.rebuild();
  if (watch) {
    await esBuildContext.watch();
  } else {
    await esBuildContext.dispose();
  }
  return output;
}
