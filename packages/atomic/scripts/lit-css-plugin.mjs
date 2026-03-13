import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {basename, dirname, join, posix, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import cssnano from 'cssnano';
import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import colors from '../../../utils/ci/colors.mjs';
import {generateLitExports} from './generate-lit-exports.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = join(__dirname, '..');
const srcDir = join(packageDir, 'src');
const esmDir = join(packageDir, 'dist/esm');
const cjsDir = join(packageDir, 'dist/cjs');

function moduleExport(value, format) {
  return format === 'cjs'
    ? `module.exports = ${value};\n`
    : `export default ${value};\n`;
}

function jsExt(format) {
  return format === 'cjs' ? '.cjs' : '.js';
}

function escapeBackslashes(css) {
  return css.replace(/\\/g, '\\\\');
}

async function minifyCss(result, filename) {
  const minifyResult = await postcss([cssnano()]).process(result.css, {
    from: filename,
  });
  return minifyResult.css;
}

// ── SVG module generation ──────────────────────────────────────────────────────

/**
 * Create JS wrapper modules for SVG files.
 * In `bundle: false` mode, rslib doesn't process SVG imports through loaders,
 * so we generate the JS modules as a post-build step.
 */
function createSvgModules(distDir, format = 'esm') {
  const srcImagesDir = join(srcDir, 'images');
  const distImagesDir = join(distDir, 'images');
  mkdirSync(distImagesDir, {recursive: true});

  const svgFiles = readdirSync(srcImagesDir).filter((f) => f.endsWith('.svg'));
  for (const svg of svgFiles) {
    const content = readFileSync(join(srcImagesDir, svg), 'utf8');
    const outPath = join(distImagesDir, svg.replace('.svg', jsExt(format)));
    writeFileSync(outPath, moduleExport(JSON.stringify(content), format));
  }
  console.log(
    colors.bgGreen(`Created ${svgFiles.length} SVG modules (${format}) in`),
    colors.green('images/')
  );
}

// ── JSON module generation ──────────────────────────────────────────────────────

/**
 * Create JS wrapper modules for JSON files imported in source.
 * In `bundle: false` mode, rslib rewrites `.json` imports to `.js` but doesn't
 * emit corresponding JS wrapper modules, so we generate them as a post-build step.
 */
function createJsonModules(distDir, format = 'esm') {
  const generatedDir = join(srcDir, 'generated');
  const distGeneratedDir = join(distDir, 'generated');
  mkdirSync(distGeneratedDir, {recursive: true});

  const jsonFiles = readdirSync(generatedDir).filter((f) =>
    f.endsWith('.json')
  );
  for (const file of jsonFiles) {
    const content = readFileSync(join(generatedDir, file), 'utf8');
    const outPath = join(
      distGeneratedDir,
      file.replace('.json', jsExt(format))
    );
    writeFileSync(outPath, moduleExport(content.trim(), format));
  }
  console.log(
    colors.bgGreen(`Created ${jsonFiles.length} JSON modules (${format}) in`),
    colors.green('generated/')
  );
}

// ── Standalone CSS module generation ───────────────────────────────────────────

const standaloneCssFiles = [
  'utils/coveo.tw.css',
  'utils/tailwind.global.tw.css',
];

/**
 * Create JS wrapper modules for standalone `.tw.css` files.
 * These are processed through PostCSS (Tailwind) + cssnano and emitted as JS string modules.
 */
async function createCssModules(distDir, format = 'esm') {
  const {plugins, options} = await postcssLoadConfig();

  for (const cssFile of standaloneCssFiles) {
    const srcPath = join(srcDir, cssFile);
    const content = readFileSync(srcPath, 'utf8');

    const result = await postcss(plugins).process(content, {
      ...options,
      from: srcPath,
    });
    const minified = await minifyCss(result, srcPath);
    const escaped = escapeBackslashes(minified);

    const outPath = join(distDir, `${cssFile}${jsExt(format)}`);
    mkdirSync(dirname(outPath), {recursive: true});
    if (format === 'cjs') {
      writeFileSync(
        outPath,
        `const css = \`${escaped}\`;\nmodule.exports = css;\n`
      );
    } else {
      writeFileSync(
        outPath,
        `const css = \`${escaped}\`;\nexport default css;\n`
      );
    }
    console.log(
      colors.bgGreen(`Created CSS module (${format}):`),
      colors.green(basename(outPath))
    );
  }
}

// ── Inline CSS processing ──────────────────────────────────────────────────────

function getAllJsFiles(dir, ext = '.js') {
  let results = [];
  for (const name of readdirSync(dir)) {
    const filePath = join(dir, name);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllJsFiles(filePath, ext));
    } else if (stat.isFile() && filePath.endsWith(ext)) {
      results.push(filePath);
    }
  }
  return results;
}

/**
 * Process all inline css`...` tagged template blocks in emitted JS files
 * through PostCSS/Tailwind + cssnano.
 */
async function processInlineCss(distDir, format = 'esm') {
  const ext = jsExt(format);
  console.log(colors.bold.blue(`Post-processing inline CSS (${format})`));
  const {plugins, options} = await postcssLoadConfig();
  const files = getAllJsFiles(distDir, ext);

  for (const file of files) {
    let content = readFileSync(file, 'utf8');
    const matches = [...content.matchAll(/css\s?`([\s\S]*?)`/g)];
    if (matches.length === 0) continue;

    const relativeFromDist = relative(distDir, file);
    const originalSrcFile = join(
      srcDir,
      relativeFromDist.replace(new RegExp(`\\${ext}$`), '.ts')
    );

    for (const match of matches) {
      const fullMatch = match[0];
      const rawCss = match[1];
      const result = await postcss(plugins).process(rawCss, {
        ...options,
        from: originalSrcFile,
      });

      const minified = await minifyCss(result, originalSrcFile);
      const escaped = escapeBackslashes(minified);

      content = content.split(fullMatch).join(`css\`${escaped}\``);
    }

    writeFileSync(file, content, 'utf8');
    console.log(
      colors.bgGreen('Successfully processed inline CSS'),
      colors.green(basename(file))
    );
  }
}

// ── DTS path alias resolution ──────────────────────────────────────────────────

/**
 * Resolve `@/` path aliases in declaration files to relative paths.
 * In `bundle: false` mode, rslib's DTS redirect doesn't handle tsconfig `paths` aliases,
 * so we post-process the declarations.
 */
function resolvePathAliasesInDts(dtsDir) {
  const files = getAllDtsFiles(dtsDir);

  for (const file of files) {
    let content = readFileSync(file, 'utf8');
    let modified = false;

    // Match both `from '@/...'` and `import '@/...'` (side-effect imports)
    content = content.replace(
      /((?:from|import)\s+['"])(@\/src\/[^'"]+)(['"])/g,
      (_match, prefix, importPath, suffix) => {
        // Strip @/src/ prefix to get the path relative to src/
        const withinSrc = importPath.replace('@/src/', '');
        // Resolve relative to the DTS output dir (mirrors src structure)
        const absoluteTarget = join(dtsDir, withinSrc);
        let relativePath = relative(dirname(file), absoluteTarget);
        relativePath = relativePath.split(sep).join(posix.sep);
        if (!relativePath.startsWith('.')) {
          relativePath = `./${relativePath}`;
        }
        modified = true;
        return `${prefix}${relativePath}${suffix}`;
      }
    );

    if (modified) {
      writeFileSync(file, content, 'utf8');
    }
  }
  console.log(
    colors.bgGreen('Resolved path aliases in'),
    colors.green(`${files.length} declaration files`)
  );
}

function getAllDtsFiles(dir) {
  let results = [];
  for (const name of readdirSync(dir)) {
    const filePath = join(dir, name);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllDtsFiles(filePath));
    } else if (stat.isFile() && filePath.endsWith('.d.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

// ── Rsbuild plugin ────────────────────────────────────────────────────────────

/**
 * Rsbuild plugin for the Lit component build:
 * - Pre-build: generates component index/lazy-index exports
 * - Post-build: generates SVG/CSS JS modules, processes inline Tailwind CSS,
 *   copies assets, lists external icons
 */
export function litCssPlugin() {
  return {
    name: 'lit-css-plugin',
    setup(api) {
      api.onBeforeBuild(async () => {
        console.log(colors.blue('Generating Lit exports'));
        await generateLitExports();
      });

      api.onAfterBuild(async () => {
        for (const [dir, format] of [
          [esmDir, 'esm'],
          [cjsDir, 'cjs'],
        ]) {
          createSvgModules(dir, format);
          createJsonModules(dir, format);
          await createCssModules(dir, format);
          await processInlineCss(dir, format);
        }
        resolvePathAliasesInDts(join(packageDir, 'dist/types'));

        console.log(colors.bold.blue('Post-build processing complete'));
      });
    },
  };
}
