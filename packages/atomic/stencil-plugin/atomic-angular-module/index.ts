import type {
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
import {ModuleWithProviders, NgModule, Provider} from '@angular/core';
`;

const componentImports = (components: string[]) => `
import {
${components.join(',\n')}
} from './components';
`;

const declarations = (components: string[]) => `
const DECLARATIONS = [
${components.join(',\n')}
]
`;

const atomicAngularModule = `
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
}
`;

export function generateAngularModuleDefinition(options: {
  moduleFile: string;
}): OutputTargetCustom {
  return {
    generator: async (
      _config,
      compilerCtx: CompilerCtx,
      buildCtx: BuildCtx
    ) => {
      const filteredComponents = buildCtx.components.filter((cmp) => {
        return !cmp.internal;
      });
      const componentClassNames = filteredComponents
        .map((component) => dashToPascalCase(component.tagName))
        .sort();
      compilerCtx.fs.writeFile(
        options.moduleFile,
        `${imports}
        ${componentImports(componentClassNames)}
        ${declarations(componentClassNames)}
        ${atomicAngularModule}
        `
      );
    },
    name: 'atomic-angular-module-definition',
    type: 'custom',
  };
}
