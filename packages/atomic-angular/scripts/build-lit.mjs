import {readFileSync, writeFileSync} from 'node:fs';
import cem from '@coveo/atomic/custom-elements-manifest' with {type: 'json'};

const atomicAngularModuleFilePath =
  'projects/atomic-angular/src/lib/stencil-generated/atomic-angular.module.ts';
const atomicAngularComponentFilePath =
  'projects/atomic-angular/src/lib/stencil-generated/components.ts';
const atomicAngularModuleFileContent = readFileSync(
  atomicAngularModuleFilePath,
  'utf-8'
);
let atomicAngularComponentFileContent = readFileSync(
  atomicAngularComponentFilePath,
  'utf-8'
);

const startTag = '//#region Lit Declarations';
const endTag = '//#endregion Lit Declarations';

const litDeclarations = [];
const litImports = new Set();
const defineCustomElementImports = new Set();

const isLitDeclaration = (declaration) =>
  declaration?.superclass?.name === 'LitElement';

const declarationToLitImport = (declaration) =>
  `${declaration.name} as Lit${declaration.name}`;

const declarationToDefineCustomElementImport = (declaration) =>
  `defineCustomElement${declaration.name}`;

const declarationToProxyCmp = (declaration, defineCustomElementFn) =>
  `
@ProxyCmp({
  inputs: [${(declaration.attributes || []).map((attr) => `'${attr.fieldName}'`).join(', ')}],
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

atomicAngularComponentFileContent = `${atomicAngularComponentFileContent.replace(new RegExp(`${startTag.replaceAll('/', '\\/')}.*?${endTag.replaceAll('/', '\\/')}`, 'gms'), '').trimEnd()}\n\n${startTag}\n`;

function processLitDeclaration(declaration) {
  atomicAngularComponentFileContent += declarationToProxyCmp(
    declaration,
    `() => {customElements.get('${declaration.tagName}') || customElements.define('${declaration.tagName}', Lit${declaration.name});}`
  );
  litImports.add(declarationToLitImport(declaration));
  litDeclarations.push(`${declaration.name}`);
}

function processNonLitDeclaration(declaration) {
  const defineCustomElementFn = `defineCustomElement${declaration.name}`;

  const regex = new RegExp(
    `@ProxyCmp\\(\\{([^}]*)\\}\\)\\s*\\n@Component\\(\\{([^}]*)\\}\\)\\s*\\nexport class\\s+${declaration.name}\\b`,
    'gms'
  );

  if (!regex.test(atomicAngularComponentFileContent)) {
    return;
  }

  atomicAngularComponentFileContent =
    atomicAngularComponentFileContent.replaceAll(regex, (_match, p1, p2) => {
      let newP1;
      if (p1.includes('defineCustomElementFn')) {
        newP1 = p1;
      } else if (p1.trim()) {
        newP1 = `${p1}, defineCustomElementFn: ${defineCustomElementFn}`;
      } else {
        newP1 = `defineCustomElementFn: ${defineCustomElementFn}`;
      }
      return `@ProxyCmp({${newP1}})\n@Component({standalone:false,${p2}})\nexport class ${declaration.name}`;
    });

  defineCustomElementImports.add(
    declarationToDefineCustomElementImport(declaration)
  );
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
    } else {
      processNonLitDeclaration(declaration);
    }
  }
}

if (litImports.size > 0) {
  atomicAngularComponentFileContent += `\nimport {${[...litImports].sort().join(', ')}} from '@coveo/atomic/components';\n`;
}

if (defineCustomElementImports.size > 0) {
  atomicAngularComponentFileContent += `\nimport {${[...defineCustomElementImports].sort().join(', ')}} from '@coveo/atomic/components';\n`;
}
atomicAngularComponentFileContent += `${endTag}`;

if (litDeclarations.length > 0) {
  writeFileSync(
    atomicAngularModuleFilePath,
    atomicAngularModuleFileContent
      .replace(
        /const DECLARATIONS = \[\n/m,
        `const DECLARATIONS = [\n${[...litDeclarations].sort().join(',\n')},\n`
      )
      .replace(
        /^import \{$/m,
        `import {\n${[...litDeclarations].sort().join(',\n')},`
      )
  );
}

writeFileSync(
  atomicAngularComponentFilePath,
  atomicAngularComponentFileContent.trimEnd()
);
