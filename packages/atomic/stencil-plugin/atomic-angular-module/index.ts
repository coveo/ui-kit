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
import {APP_INITIALIZER, ModuleWithProviders, NgModule, Provider} from '@angular/core';
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

const shimTemplatesPrototype = `
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
`;

const provider = `
const SHIM_TEMPLATES_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  multi: true,
  useValue: shimTemplates
}
`;

const atomicAngularModule = `
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
        ${shimTemplatesPrototype}
        ${provider}
        ${atomicAngularModule}
        `
      );
    },
    name: 'atomic-angular-module-definition',
    type: 'custom',
  };
}
