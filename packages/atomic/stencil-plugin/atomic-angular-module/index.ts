import {
  BuildCtx,
  CompilerCtx,
  OutputTargetCustom,
} from '@stencil/core/internal';

const dashToPascalCase = (str: string) =>
  str
    .toLowerCase()
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

const imports = `/* tslint:disable */
/* auto-generated angular module */
import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
`;

const componentImports = (components: string[]) => `
import {
${components.join(',\n')}
} from './components';
`;

const defineCustomElements = `
import {defineCustomElements} from '@coveo/atomic/loader';
defineCustomElements(window);\n`;

const declarations = (components: string[]) => `
const DECLARATIONS = [
${components.join(',\n')}
]
`;

const atomicAngularModule = `
@NgModule({
  declarations: DECLARATIONS,
  exports: DECLARATIONS,
  providers: [],
  imports: [CommonModule],
})
export class AtomicAngularModule {
  static forRoot(): ModuleWithProviders<AtomicAngularModule> {
    return {
      ngModule: AtomicAngularModule,
      providers: [],
    };
  }
}
`;

export function generateAngularModuleDefinition(options: {
  moduleFile: string;
}): OutputTargetCustom {
  return {
    generator: async function (
      config,
      compilerCtx: CompilerCtx,
      buildCtx: BuildCtx
    ) {
      const filteredComponents = buildCtx.components.filter((cmp) => {
        return !cmp.internal;
      });
      const componentClassNames = filteredComponents.map((component) =>
        dashToPascalCase(component.tagName)
      );
      compilerCtx.fs.writeFile(
        options.moduleFile,
        `${imports}
        ${componentImports(componentClassNames)}
        ${defineCustomElements}
        ${declarations(componentClassNames)}
        ${atomicAngularModule}
        `
      );
    },
    name: 'atomic-angular-module-definition',
    type: 'custom',
  };
}
