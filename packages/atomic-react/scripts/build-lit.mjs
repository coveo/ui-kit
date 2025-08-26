import {execSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};

const isLitDeclaration = (declaration) =>
  declaration?.superclass?.name === 'LitElement';

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
    declarations: [],
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
  entry.declarations.sort((a, b) =>
    a.name.localeCompare(b.name, 'en-US', {sensitivity: 'base'})
  );
  for (const declaration of entry.declarations) {
    entry.computedComponentImports.push(declarationToLitImport(declaration));
    entry.content += declarationToComponent(declaration);
  }
}

for (const entry of entries) {
  if (entry.computedComponentImports.length === 0) {
    writeFileSync(entry.path, 'export {}');
    // Format with Biome, like the original prettier.format() calls
    execSync(`npx @biomejs/biome format --write "${entry.path}"`, {
      stdio: 'pipe',
    });
    continue;
  }

  // Sort imports deterministically to ensure consistent output across environments
  const sortedImports = entry.computedComponentImports.toSorted((a, b) =>
    a.localeCompare(b, 'en-US', {sensitivity: 'base'})
  );

  writeFileSync(
    entry.path,
    [
      `import {createComponent} from '@lit/react';`,
      `import React from 'react';`,
      `import {${sortedImports.join(',')}} from '@coveo/atomic/components';`,
      entry.content,
    ].join('\n')
  );
  // Format with Biome, like the original prettier.format() calls
  execSync(`npx @biomejs/biome check --write "${entry.path}"`, {stdio: 'pipe'});
}
