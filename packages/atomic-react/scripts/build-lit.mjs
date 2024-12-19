import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};
import {writeFileSync} from 'node:fs';
import * as prettier from 'prettier';



const isLitDeclaration = (declaration) =>
  declaration?.superclass?.name === 'LitElement' || declaration?.superclass?.name === 'TailwindLitElement';

const entries = [
  {
    path: 'src/components/search/components.ts',
    content: '',
    excludedComponents: [
      'atomic-result-template',
      'atomic-recs-result-template',
      'atomic-field-condition',
    ],
    excludedComponentDirectories: ['src/components/commerce'],
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
    excludedComponentDirectories: [
      'src/components/search',
      'src/components/recommendations',
    ],
    computedComponentImports: [],
  },
];

const declarationToLitImport = (declaration) =>
  `${declaration.name} as Lit${declaration.name}`;

const declarationToComponent = (declaration) =>
  `
export const ${declaration.name} = createComponent({
  tagName: '${declaration.tagName}',
  react: React,
  elementClass: Lit${declaration.name},
});
`;

for (const module of cem.modules) {
  console.log(`Processing module: ${module.path}`);
  for (const declaration of module.declarations) {
    if (isLitDeclaration(declaration)) {
      console.log(`Found LitElement declaration: ${declaration.name}`);
      for (const entry of entries) {
        if (
          entry.excludedComponentDirectories.some((directory) =>
            module.path.startsWith(directory)
          ) ||
          entry.excludedComponents.includes(declaration.tagName)
        ) {
          console.log(`Skipping excluded component: ${declaration.tagName}`);
          continue;
        }
        console.log(`Adding component: ${declaration.name} to ${entry.path}`);
        entry.computedComponentImports.push(
          declarationToLitImport(declaration)
        );
        entry.content+=(declarationToComponent(declaration));
      }
    }
  }
}

for (const entry of entries) {
  console.log(`Writing file: ${entry.path}`);
  console.log(`Components to import: ${entry.computedComponentImports.length}`);
  
  const prettierConfig = {
    ...(await prettier.resolveConfig(entry.path)),
    parser: 'typescript'
  };
  if(entry.computedComponentImports.length===0) {
    console.log(`No components for ${entry.path}, writing empty export`);
    writeFileSync(entry.path, await prettier.format('export {}', prettierConfig));
    continue;
  }
  writeFileSync(
    entry.path,
    await prettier.format(
      [
        `import {createComponent} from '@lit/react';`,
        `import React from 'react';`,
        `import {${entry.computedComponentImports.join(',')}} from '@coveo/atomic/components';`,
        entry.content
      ].join('\n'),
      prettierConfig
    )
  );
  console.log(`Successfully wrote ${entry.path}`);
}

console.log('Build complete!');