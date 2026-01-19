/**
 * Layer 3: Component Extraction Rules
 *
 * Domain-specific configuration for extracting Atomic components from ui-kit:
 * - Lit components (extends LitElement)
 * - Stencil components (@Component decorator)
 * - Stencil functional components (Stencil* prefix)
 * - Lit functional components (render* prefix with FunctionalComponent type)
 *
 * Components live in packages/atomic/src/components/
 */

import fs from 'node:fs';

export type ComponentFramework = 'lit' | 'stencil';
export type ComponentType = 'atomic' | 'functional';

export interface ComponentProperties {
  name: string;
  path: string;
  framework: ComponentFramework;
  type: ComponentType;
  tag?: string;
  [key: string]: unknown;
}

export interface ComponentData {
  name: string;
  labels: string[];
  properties: ComponentProperties;
}

/**
 * Glob pattern for component files
 */
export const componentGlob = 'packages/atomic/src/components/**/*.{ts,tsx}';

/**
 * Patterns to ignore
 */
export const componentIgnore = ['**/*.spec.ts', '**/*.spec.tsx', '**/*.e2e.ts'];

/**
 * Extract components from file content
 * Returns array of component definitions with metadata
 */
export function extractComponentsFromFile(
  filePath: string,
  relativePath: string
): ComponentData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const components: ComponentData[] = [];

  // Pattern 1: Lit components
  // Matches: export class Foo extends LitElement
  //          export class Foo extends SomeMixin(LitElement)
  const litComponentMatch = content.match(
    /export\s+class\s+(\w+)\s+extends\s+[^{]*?LitElement[^{]*/
  );
  if (litComponentMatch) {
    const componentName = litComponentMatch[1];
    components.push({
      name: componentName,
      labels: ['Component', 'LitComponent'],
      properties: {
        name: componentName,
        path: relativePath,
        framework: 'lit',
        type: 'atomic',
      },
    });
  }

  // Pattern 2: Stencil components
  // Matches: @Component({ tag: 'atomic-foo' })
  const stencilComponentMatch = content.match(
    /@Component\s*\(\s*{[\s\S]*?tag:\s*['"]([^'"]+)['"]/
  );
  if (stencilComponentMatch) {
    const tagName = stencilComponentMatch[1];
    const className = content.match(/export\s+class\s+(\w+)/)?.[1];

    if (className) {
      components.push({
        name: className,
        labels: ['Component', 'StencilComponent'],
        properties: {
          name: className,
          path: relativePath,
          framework: 'stencil',
          type: 'atomic',
          tag: tagName,
        },
      });
    }
  }

  // Pattern 3: Stencil functional components
  // Matches: export const StencilFoo or export function StencilFoo
  const stencilFunctionalMatch = content.match(
    /export\s+(?:const|function)\s+(Stencil\w+)/
  );
  if (stencilFunctionalMatch) {
    const componentName = stencilFunctionalMatch[1];
    components.push({
      name: componentName,
      labels: ['Component', 'FunctionalComponent'],
      properties: {
        name: componentName,
        path: relativePath,
        framework: 'stencil',
        type: 'functional',
      },
    });
  }

  // Pattern 4: Lit functional components
  // Matches: export const renderFoo: FunctionalComponent<...>
  const litFunctionalMatch = content.match(
    /export\s+const\s+(render\w+)\s*:\s*FunctionalComponent/
  );
  if (litFunctionalMatch) {
    const componentName = litFunctionalMatch[1];
    components.push({
      name: componentName,
      labels: ['Component', 'FunctionalComponent'],
      properties: {
        name: componentName,
        path: relativePath,
        framework: 'lit',
        type: 'functional',
      },
    });
  }

  return components;
}

/**
 * Generate cache keys for a component
 * Multi-key strategy: name, name:framework, path
 */
export function generateComponentCacheKeys(
  componentData: ComponentData
): string[] {
  const {name, path, framework} = componentData.properties;

  return [
    `component:${name}`,
    `component:${name}:${framework}`,
    `component:${path}`,
  ];
}
