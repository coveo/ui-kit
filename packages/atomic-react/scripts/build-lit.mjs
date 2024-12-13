import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};
import {createWriteStream} from 'fs';

const isLitDeclaration = (declaration) =>
  declaration?.superclass?.name === 'LitElement';

const entries = [
  {
    file: createWriteStream('src/components/search/components.ts'),
    excludedComponents: [
      'atomic-result-template',
      'atomic-recs-result-template',
      'atomic-field-condition',
    ],
    excludedComponentDirectories: ['src/components/commerce'],
    computedComponentImports: [],
  },
  {
    file: createWriteStream('src/components/commerce/components.ts'),
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
    console.log(`Declaration: ${declaration.name}`);
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
        entry.file.write(declarationToComponent(declaration));
      }
    }
  }
}

for (const entry of entries) {
  entry.file.write(
    `
import {createComponent} from '@lit/react';
import React from 'react';
import {${entry.computedComponentImports.join(',')}} from '@coveo/atomic/components';
`
  );
  entry.file.end();
}
