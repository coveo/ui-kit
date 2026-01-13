import {dirname} from 'node:path';
import cssnano from 'cssnano';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import type {Plugin} from 'vite';

function escapeBackslashes(css: string): string {
  return css.replace(/\\/g, '\\\\');
}

async function minifyCss(css: string, filename: string): Promise<string> {
  const minifyResult = await postcss([cssnano()]).process(css, {
    from: filename,
  });
  return minifyResult.css;
}

async function processAndMinifyCss(
  content: string,
  filename: string
): Promise<string> {
  const configPath = dirname(filename);
  const {plugins, options} = await postcssLoadConfig({}, configPath);
  const result = await postcss(plugins).process(content, {
    ...options,
    from: filename,
  });

  let processedCss = await minifyCss(result.css, filename);
  processedCss = escapeBackslashes(processedCss);

  return processedCss;
}

/**
 * Vite plugin that processes inline CSS in .tw.css.ts and .ts files through PostCSS/Tailwind.
 * This matches the behavior of the custom build script's processInlineCss function.
 */
export function preprocessTwCssTs(): Plugin {
  return {
    name: 'preprocess-tw-css-ts',
    enforce: 'pre',
    async transform(code, id) {
      // Only process TypeScript files
      if (!id.endsWith('.ts')) {
        return null;
      }

      try {
        // Match css`...` tagged template blocks
        const matches = [...code.matchAll(/css\s*`([\s\S]*?)`/g)];
        if (matches.length === 0) {
          return null;
        }

        // Only process if CSS contains @import, @reference, or other Tailwind directives
        const hasCssDirectives = matches.some((match) =>
          /@(import|reference|apply|layer|theme)\s/.test(match[1])
        );
        if (!hasCssDirectives) {
          return null;
        }

        let transformedCode = code;

        for (const match of matches) {
          const fullMatch = match[0];
          const rawCss = match[1];

          // Process the CSS through PostCSS/Tailwind
          const processedCss = await processAndMinifyCss(rawCss, id);

          // Replace the original CSS with the processed version
          transformedCode = transformedCode
            .split(fullMatch)
            .join(`css\`${processedCss}\``);
        }

        return {
          code: transformedCode,
          map: null,
        };
      } catch (error) {
        console.error(`Error processing CSS in ${id}:`, error);
        // Return original code on error to avoid breaking the build
        return null;
      }
    },
  };
}
