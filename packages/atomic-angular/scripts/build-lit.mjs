import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};

const stencilGeneratedDir = 'projects/atomic-angular/src/lib/generated';

const atomicAngularModuleFilePath = join(
  stencilGeneratedDir,
  'atomic-angular.module.ts'
);
const atomicAngularComponentFilePath = join(
  stencilGeneratedDir,
  'components.ts'
);

mkdirSync(stencilGeneratedDir, {recursive: true});

const litDeclarations = [];
const litImports = new Set();
const defineCustomElementImports = new Set();

const isLitDeclaration = (declaration) =>
  declaration?.superclass?.name === 'LitElement';

const declarationToLitImport = (declaration) =>
  `${declaration.name} as Lit${declaration.name}`;

const declarationToProxyCmp = (declaration, defineCustomElementFn) =>
  `
@ProxyCmp({
  inputs: [${(declaration.attributes || [])
    .flatMap((attribute) => {
      if (!attribute.fieldName) {
        return [];
      }
      const member = declaration.members?.find(
        (m) => m.name === attribute.fieldName
      );
      if (
        !member ||
        member.privacy === 'private' ||
        member.privacy === 'protected' ||
        member.kind !== 'field'
      ) {
        return [];
      }
      return [`'${attribute.fieldName}'`];
    })
    .join(', ')}],
  methods: [${(declaration.members || [])
    .filter((member) => member.privacy === 'public' && member.kind === 'method')
    .map((method) => `'${method.name}'`)
    .join(', ')}],
  defineCustomElementFn: ${defineCustomElementFn}
})
@Component({
  selector: '${declaration.tagName}',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [${(declaration.attributes || []).map((attr) => `'${attr.fieldName}'`).join(', ')}]
})
export class ${declaration.name} {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    ${declaration.events?.length ? `proxyOutputs(this, this.el, [${declaration.events.map((event) => `'${event.name}'`).join(', ')}]);` : ''}
  }
}

export declare interface ${declaration.name} extends Lit${declaration.name} {
${(declaration.events || [])
  .map((event) => `  '${event.name}': EventEmitter<CustomEvent<any>>;`)
  .join('\n')}
}
`;

let atomicAngularComponentFileContent = `
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';
import { ProxyCmp, proxyOutputs, proxyInputs, proxyMethods, defineCustomElement } from '../../utils';
`;

function processLitDeclaration(declaration) {
  atomicAngularComponentFileContent += declarationToProxyCmp(
    declaration,
    `() => {customElements.get('${declaration.tagName}') || customElements.define('${declaration.tagName}', Lit${declaration.name});}`
  );
  litImports.add(declarationToLitImport(declaration));
  litDeclarations.push(`${declaration.name}`);
}

// Sort modules by path to ensure deterministic processing order
const sortedModules = [...cem.modules].toSorted((a, b) =>
  (a.path || '').localeCompare(b.path || '')
);
for (const module of sortedModules) {
  // Sort declarations by name to ensure deterministic processing order
  const sortedDeclarations = [...module.declarations].toSorted((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );
  for (const declaration of sortedDeclarations) {
    if (isLitDeclaration(declaration)) {
      processLitDeclaration(declaration);
    }
  }
}

if (litImports.size > 0) {
  atomicAngularComponentFileContent += `\n
import {
  ${[...litImports].sort().join(',\n  ')}
} from '@coveo/atomic/components';\n`;
}

if (defineCustomElementImports.size > 0) {
  atomicAngularComponentFileContent += `
import {
  ${[...defineCustomElementImports].sort().join(',\n  ')}
} from '@coveo/atomic/components';\n`;
}

if (litDeclarations.length > 0) {
  const atomicAngularModuleFileContent = `
import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';

import {
  ${[...litDeclarations].sort().join(',\n  ')}
} from './components';

const DECLARATIONS = [
  ${[...litDeclarations].sort().join(',\n  ')}
];

@NgModule({
  declarations: DECLARATIONS,
  exports: DECLARATIONS,
  imports: [CommonModule],
})
export class AtomicAngularModule {
  static forRoot(): ModuleWithProviders<AtomicAngularModule> {
    return {
      ngModule: AtomicAngularModule,
      providers: [],
    };
  }
}`;
  writeFileSync(atomicAngularModuleFilePath, atomicAngularModuleFileContent);
}

writeFileSync(
  atomicAngularComponentFilePath,
  atomicAngularComponentFileContent.trimEnd()
);
