import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};

const stencilGeneratedDir = 'projects/atomic-angular/src/lib/stencil-generated';

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
  inputs: [${(declaration.members || [])
    .flatMap((member) => {
      if (!member.privacy === 'public' || member.kind !== 'field') {
        return [];
      }
      const inputs = [`'${member.name}'`];
      if (member.attribute) {
        inputs.push(`'${member.attribute}'`);
      }
      return inputs;
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
import {APP_INITIALIZER, ModuleWithProviders, NgModule, Provider} from '@angular/core';

import {
  ${[...litDeclarations].sort().join(',\n  ')}
} from './components';

const DECLARATIONS = [
  ${[...litDeclarations].sort().join(',\n  ')}
];

const shimTemplates = ()=> {
  // Angular's renderer will add children to a <template> instead of to its
  // content. This shim will force any children added to a <template> to be
  // added to its content instead.
  // https://github.com/angular/angular/issues/15557
  const nativeAppend = HTMLTemplateElement && HTMLTemplateElement.prototype && HTMLTemplateElement.prototype.appendChild;
  if(!nativeAppend) {
    return;
  }
  HTMLTemplateElement.prototype.appendChild = function<T extends Node>(
    childNode: T
  ) {
    if (this.content) {
      return this.content.appendChild(childNode);
    } else {
      return <T>nativeAppend.apply(this, [childNode]);
    }
  };
}

        
const SHIM_TEMPLATES_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  multi: true,
  useValue: shimTemplates
}

        
@NgModule({
  declarations: DECLARATIONS,
  exports: DECLARATIONS,
  providers: [SHIM_TEMPLATES_PROVIDER],
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
