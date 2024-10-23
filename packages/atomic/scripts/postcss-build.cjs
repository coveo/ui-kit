const autoprefixer = require('autoprefixer');
const {readFileSync, writeFileSync} = require('fs');
const postCssFactory = require('postcss');
const focusVisible = require('postcss-focus-visible');
const atImport = require('postcss-import');
const postcssMap = require('postcss-map');
const mixins = require('postcss-mixins');
const postcssNesting = require('postcss-nested');
const tailwind = require('tailwindcss');
const tailwindNesting = require('tailwindcss/nesting');
const cssnano = require('cssnano');
const {join, dirname} = require('path');
const {dedent} = require('ts-dedent');
const postCss = postCssFactory([
  atImport(),
  postcssMap({
    maps: [
      'src/components/common/template-system/post-css-map-for-sections.yaml',
    ],
  }),
  mixins(),
  tailwindNesting(),
  tailwind(),
  focusVisible(),
  postcssNesting(),
  autoprefixer(),
  cssnano({preset: 'default'}),
]);

const files = [
  'src/components/commerce/facets/atomic-commerce-category-facet/atomic-commerce-category-facet.pcss',
  'src/components/commerce/facets/atomic-commerce-facet/atomic-commerce-facet.pcss',
];

const cssToJs = (css) => `const css = \`${css}\`;`;

const importMatcher = /(?<=^@import\s+').*\.pcss(?=';$)/gm;
const importWholeLineMatcher = /^@import\s+'.*\.pcss';$/gm;

const pushImports = (currentFile, importPaths) => {
  for (const importPath of importPaths) {
    const resolvedPath = join(dirname(currentFile), importPath);
    if (!files.includes(resolvedPath)) {
      files.push(resolvedPath);
    }
  }
};

(async () => {
  while (files.length) {
    const file = files.shift();
    const dest = file.replace(/.pcss$/, '.css.ts');
    let content = readFileSync(file, {encoding: 'utf-8'});
    const imports = Array.from(content.matchAll(importMatcher)).flatMap(
      (match) => match
    );
    pushImports(file, imports);
    content = content.replace(importWholeLineMatcher, '');

    const result = await postCss.process(content, {
      from: file,
      to: dest,
    });
    let importIndex = 0;
    const fileContent = dedent`
    // This file is generated by postcss-build.cjs
    ${imports.map((importPath) => `import dep${importIndex++} from '${importPath.replace(/.pcss$/, '.css')}';`).join('\n')}
    
    ${cssToJs(result.css)}
    const allCss: string[] = [${imports
      .map((_, index) => `...dep${index}`)
      .concat('css')
      .join(', ')}];
    export default allCss;

    `;
    writeFileSync(dest, fileContent, {encoding: 'utf-8'});
  }
})();
