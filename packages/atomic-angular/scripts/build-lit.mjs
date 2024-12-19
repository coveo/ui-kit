import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};
import { createWriteStream, readFileSync, writeFileSync } from 'fs';

const isLitDeclaration = (declaration) => declaration?.superclass?.name === 'LitElement' || declaration?.superclass?.name === 'TailwindLitElement';

const atomicAngularModuleFilePath ='projects/atomic-angular/src/lib/stencil-generated/atomic-angular.module.ts';
const atomicAngularModuleFileContent = readFileSync(atomicAngularModuleFilePath, 'utf-8');
const atomicAngularComponentFileStream = createWriteStream('projects/atomic-angular/src/lib/stencil-generated/components.ts', {flags: 'a'});
const litDeclarations = [];


const declarationToProxyCmp = (declaration) =>
`
@ProxyCmp({
  inputs: [${declaration.attributes.map(attr => `'${attr.name}'`).join(', ')}]
})
@Component({
  selector: '${declaration.tagName}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [${declaration.attributes.map(attr => `'${attr.name}'`).join(', ')}]
})
export class ${declaration.name} {
  protected readonly el: HTMLElement;
  constructor(c: ChangeDetectorRef, el: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = el.nativeElement;
  }
}

export declare interface ${declaration.name} extends Lit${declaration.name} {}
`

const declarationToLitImport = (declaration) => `${declaration.name} as Lit${declaration.name}`;

const litImports = []

for (const module of cem.modules) {
  for (const declaration of module.declarations) {
    if (isLitDeclaration(declaration)) {
      atomicAngularComponentFileStream.write(declarationToProxyCmp(declaration));
      litImports.push(declarationToLitImport(declaration));
      litDeclarations.push(`${declaration.name}`);
    }
  }
}
atomicAngularComponentFileStream.write(`\nimport type {${litImports.join(',')}} from '@coveo/atomic/components';`);
atomicAngularComponentFileStream.end();



writeFileSync(
  atomicAngularModuleFilePath,
  atomicAngularModuleFileContent
    .replace(/const DECLARATIONS = \[\n/m, `const DECLARATIONS = [\n${litDeclarations.join(',\n')},\n`)
    .replace(/^import \{$/m, `import {\n${litDeclarations.join(',\n')},`)
);