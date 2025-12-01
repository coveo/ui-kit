---
applyTo: 'packages/atomic/src/components/**/stencil-*.tsx, packages/atomic/src/components/**/stencil-*.spec.ts'
---

## Scope
- Use these instructions when writing unit tests for Stencil `FunctionalComponent` exports in `packages/atomic`.
- Keep assertions framework-agnostic so that future implementation changes require minimal test updates.

## Required References
- Follow [Atomic component instructions](./atomic.instructions.md) for package conventions.
- Follow [Atomic test instructions](./tests-atomic.instructions.md) for structure, naming, mocking patterns, and running tests.
- Review existing examples such as `packages/atomic/src/components/search/result-template-components/quickview-iframe/stencil-quickview-iframe.spec.ts` before creating new tests.

## Production files are read-only.

Do NOT edit the production files (.tsx)

If you can't create unit tests without modifying the production files, stop and ask the user for help.

## Identify Files to Test
- Components reside under `packages/atomic/src/components/<feature>/<name>/`.
- Each folder contains one primary file named `stencil-<component>.tsx` matching the folder name.
- Additional `.tsx` files in the same folder that export a Stencil `FunctionalComponent` must also receive unit tests.

## Test File Setup
- Place new spec files beside the implementation and name them `stencil-<component>.spec.ts`.
- Test files must use `.ts` (no JSX syntax).
- Import utilities from `@stencil/core` using `type`-only imports to avoid bundling runtime code.
- Use `renderStencilVNode` from `@/vitest-utils/testing-helpers/stencil-vnode-renderer` to mount the virtual node into the DOM prior to assertions.
- Avoid importing `Fragment` from `@stencil/core`; prefer arrays or wrapper elements when a fragment-like structure is required.

### Boilerplate Pattern
```ts
import type {VNode} from '@stencil/core';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {renderStencilVNode} from '@/vitest-utils/testing-helpers/stencil-vnode-renderer';
import {Component} from './stencil-component';

describe('Component (Stencil)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const renderComponent = async (props?: {
    /* component-specific props */
  }) => {
    const vnode = Component(
      {
        /* component-specific props */
      },
      [],
      // biome-ignore lint/suspicious/noExplicitAny: Provide a context-specific justification for using 'any' here (e.g., type incompatibility or unused parameter).
      {} as any
    ) as VNode;

    await renderStencilVNode(vnode, container);

    const element = container.firstElementChild;

    return {element};
  };

  it('should ...', async () => {
    const {element} = await renderComponent({/* props */});
    expect(element).toBeTruthy();
  });
});
```

### Internationalization Helpers
- When a component relies on i18n, use `createTestI18n` from `@/vitest-utils/testing-helpers/i18n-utils`.

```ts
import type {i18n} from 'i18next';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';

describe('Component (Stencil)', () => {
  let i18n: i18n;

  // Use `beforeAll` here because i18n setup is expensive and can be shared across tests.
  // Prefer `beforeAll` for expensive, shared setup (e.g., i18n, global mocks).
  // Use `beforeEach`/`afterEach` for per-test isolation (e.g., DOM containers, spies).
  beforeAll(async () => {
    i18n = await createTestI18n();
  });
});
```

## Test Guidelines
- Cover every exported `FunctionalComponent` in the folder.
- Focus on observable DOM output and events rather than internal implementation details.
- Prefer helper functions within the spec for repeated setup or assertions.
- Do not edit Stencil production `.tsx` files while authoring tests. If changes seem necessary, pause and escalate.
