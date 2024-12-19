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
        entry.computedComponentImports.push(
          declarationToLitImport(declaration)
        );
        entry.content+=(declarationToComponent(declaration));
      }
    }
  }
}

for (const entry of entries) {
  const prettierConfig = {
    ...(await prettier.resolveConfig(entry.path)),
    parser: 'typescript'
  };
  if(entry.computedComponentImports.length===0) {
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
}