import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};
import { createWriteStream, readFileSync, writeFileSync } from 'fs';

const isLitDeclaration = (declaration) => declaration?.superclass?.name === 'LitElement' || declaration?.superclass?.name === 'TailwindLitElement';

const atomicAngularModuleFilePath ='projects/atomic-angular/src/lib/stencil-generated/atomic-angular.module.ts';
const atomicAngularComponentFilePath = 'projects/atomic-angular/src/lib/stencil-generated/components.ts';
let atomicAngularModuleFileContent = readFileSync(atomicAngularModuleFilePath, 'utf-8');
let atomicAngularComponentFileContent = readFileSync(atomicAngularComponentFilePath, 'utf-8');
const litDeclarations = [];

const startTag = '//#region Lit Declarations';
const endTag = '//#endregion Lit Declarations';
const declarationToProxyCmp = (declaration) =>
`
@ProxyCmp({
  inputs: [${declaration.attributes.map(attr => `'${attr.fieldName}'`).join(', ')}]
})
@Component({
  selector: '${declaration.tagName}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [${declaration.attributes.map(attr => `'${attr.fieldName}'`).join(', ')}]
})
export class ${declaration.name} {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
    proxyOutputs(this, this.el, [${declaration.events.map(event => `'${event.name}'`).join(', ')}]);
  }
}

export declare interface ${declaration.name} extends Lit${declaration.name} {
${declaration.events
  .map(event => `  '${event.name}': EventEmitter<CustomEvent<any>>;`)
  .join('\n')}
}
`
atomicAngularComponentFileContent = atomicAngularComponentFileContent.replace(new RegExp(`${startTag}.*?${endTag}`, 'gm'), '').trimEnd() + `\n\n${startTag}\n`;

const declarationToLitImport = (declaration) => `${declaration.name} as Lit${declaration.name}`;

const litImports = []

for (const module of cem.modules) {
  for (const declaration of module.declarations) {
    if (isLitDeclaration(declaration)) {
      atomicAngularComponentFileContent += declarationToProxyCmp(declaration);
      litImports.push(declarationToLitImport(declaration));
      litDeclarations.push(`${declaration.name}`);
    }
  }
}

atomicAngularComponentFileContent += `\nimport type {${litImports.join(', ')}} from '@coveo/atomic/components';\n${endTag}`;


if(litDeclarations.length > 0) {
  writeFileSync(
    atomicAngularModuleFilePath,
    atomicAngularModuleFileContent
      .replace(/const DECLARATIONS = \[\n/m, `const DECLARATIONS = [\n${litDeclarations.join(',\n')},\n`)
      .replace(/^import \{$/m, `import {\n${litDeclarations.join(',\n')},`)
  );

  writeFileSync(atomicAngularComponentFilePath, atomicAngularComponentFileContent.trimEnd());
}