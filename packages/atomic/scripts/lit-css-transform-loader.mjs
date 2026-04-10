import cssnano from 'cssnano';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';

let cachedConfig;
async function getPostcssConfig() {
  if (!cachedConfig) {
    cachedConfig = await postcssLoadConfig();
  }
  return cachedConfig;
}

function escapeBackslashes(css) {
  return css.replace(/\\/g, '\\\\');
}

async function processCss(rawCss, from, {escape = true} = {}) {
  const {plugins, options} = await getPostcssConfig();
  const result = await postcss(plugins).process(rawCss, {...options, from});
  const minified = await postcss([cssnano()]).process(result.css, {from});
  return escape ? escapeBackslashes(minified.css) : minified.css;
}

/**
 * Rspack loader that processes CSS tagged template literals (`css\`...\``)
 * through PostCSS/Tailwind with the correct source file context.
 *
 * For `.tw.css` files: processes the entire file as CSS and exports as a JS string.
 * For `.ts` files: processes inline `css\`...\`` blocks in-place.
 */
export default async function litCssTransformLoader(source) {
  const callback = this.async();
  const resourcePath = this.resourcePath;

  try {
    if (resourcePath.endsWith('.tw.css')) {
      const processed = await processCss(source, resourcePath, {escape: false});
      return callback(null, `export default ${JSON.stringify(processed)};`);
    }

    if (!source.includes('css`') && !source.includes('css `')) {
      return callback(null, source);
    }

    let modified = source;
    const matches = [...source.matchAll(/css\s?`([\s\S]*?)`/g)];

    for (const match of matches) {
      const fullMatch = match[0];
      const rawCss = match[1];
      const processed = await processCss(rawCss, resourcePath);
      modified = modified.split(fullMatch).join(`css\`${processed}\``);
    }

    callback(null, modified);
  } catch (err) {
    callback(err);
  }
}
