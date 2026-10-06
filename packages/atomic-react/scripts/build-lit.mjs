import {existsSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};

const isLitDeclaration = (declaration) => declaration?.superclass?.name === 'LitElement';

const entries = [
  {
    path: 'src/components/search/components.ts',
    content: '',
    excludedComponents: [
      'atomic-result-template',
      'atomic-recs-result-template',
      'atomic-field-condition',
    ],
    declarations: [],
    excludedComponentDirectories: [
      'src/components/commerce',
      'src/components/insight',
      'src/components/ipx',
    ],
    computedComponentImports: [],
  },
  {
    path: 'src/components/commerce/components.ts',
    content: '',
    excludedComponents: [
      'atomic-product-template',
      'atomic-recs-result-template',
      'atomic-field-condition',
    ],
    declarations: [],
    excludedComponentDirectories: [
      'src/components/search',
      'src/components/recommendations',
      'src/components/insight',
      'src/components/ipx',
    ],
    computedComponentImports: [],
  },
];

// Each element is imported from its own `@coveo/atomic/components/<tag-name>` entry point rather
// than from the barrel, so the wrapper only pulls in the elements a consumer uses, whatever the
// bundler does with the barrel's side effects.
const declarationToEntryPoint = (declaration) => `@coveo/atomic/components/${declaration.tagName}`;

const declarationToLitImport = (declaration) => {
  const entryPoint = declarationToEntryPoint(declaration);
  if (!existsSync(fileURLToPath(import.meta.resolve(entryPoint)))) {
    throw new Error(
      `${declaration.tagName} has no ${entryPoint} entry point. Build @coveo/atomic first, or check that the element's directory sits directly under its use-case folder.`
    );
  }
  return `import {${declaration.name} as Lit${declaration.name}} from '${entryPoint}';`;
};

const declarationToComponent = (declaration) =>
  `
export const ${declaration.name} = /*@__PURE__*/ createComponent({
  tagName: '${declaration.tagName}',
  react: React,
  elementClass: Lit${declaration.name},
});
`;

for (const module of cem.modules) {
  if (module.declarations.length === 0) {
    continue;
  }
  for (const declaration of module.declarations) {
    if (isLitDeclaration(declaration)) {
      for (const entry of entries) {
        if (
          entry.excludedComponentDirectories.some((directory) =>
            module.path.startsWith(directory)
          ) ||
          entry.excludedComponents.includes(declaration.tagName)
        ) {
          continue;
        }
        entry.declarations.push(declaration);
      }
    }
  }
}

for (const entry of entries) {
  if (entry.declarations.length === 0) {
    continue;
  }
  entry.declarations.sort((a, b) => a.name.localeCompare(b.name, 'en-US', {sensitivity: 'base'}));
  for (const declaration of entry.declarations) {
    entry.computedComponentImports.push(declarationToLitImport(declaration));
    entry.content += declarationToComponent(declaration);
  }
}

for (const entry of entries) {
  if (entry.computedComponentImports.length === 0) {
    writeFileSync(entry.path, 'export {}');
    continue;
  }

  writeFileSync(
    entry.path,
    [
      `import {createComponent} from '@lit/react';`,
      `import React from 'react';`,
      ...entry.computedComponentImports,
      entry.content,
    ].join('\n')
  );
}
