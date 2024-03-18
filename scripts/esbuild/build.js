import {context} from 'esbuild';

/**
 * @param {import('esbuild').BuildOptions} options
 * @param {boolean} [watch]
 */
export async function build(options, watch = false) {
  const esBuildContext = await context(options);
  const output = await esBuildContext.rebuild();
  if (watch) {
    await esBuildContext.watch();
  }
  await esBuildContext.dispose();
  return output;
}
