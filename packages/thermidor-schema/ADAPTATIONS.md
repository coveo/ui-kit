# Adaptation Registry

This document lists every named adaptation between the external reference (PR #17 from `coveo-platform/thermidor-schema`, commit `b046dea970dcdb427065f9daf61c910d172fc31e`) and this monorepo package.

## Adaptations

### TypeScript version

- **Category**: Alignement_de_Version_Monorepo
- **Justification**: The monorepo pins TypeScript via the pnpm catalog; all packages must use the same version.
- **External value**: `typescript@7.0.2`
- **Adapted value**: `typescript: "catalog:"` (resolves to 6.0.3)

### Recursive type workaround

- **Category**: Alignement_de_Version_Monorepo
- **Justification**: TypeScript 6.0.3 cannot infer recursive types via `z.infer` (TS2615). The generator emits `// @ts-expect-error` for recursive types. This is unnecessary with TypeScript 7+ and can be removed when the monorepo upgrades.
- **External value**: No `@ts-expect-error` needed (TypeScript 7 resolves recursive inference)
- **Adapted value**: `// @ts-expect-error TS2615` emitted before `export type` for recursive schemas

### Vitest version

- **Category**: Alignement_de_Version_Monorepo
- **Justification**: The monorepo pins Vitest via the pnpm catalog.
- **External value**: `vitest@4.1.10`
- **Adapted value**: `vitest: "catalog:"` (resolves to 4.1.10 — same version)

### pnpm version

- **Category**: Alignement_de_Version_Monorepo
- **Justification**: The monorepo pins pnpm via the root `packageManager` field.
- **External value**: `pnpm@11.17.0` (declared in external root `packageManager`)
- **Adapted value**: Inherited from root `packageManager` (pnpm@10.34.5). No local `packageManager` field.

### Node.js version

- **Category**: Intégration_Workspace_Monorepo
- **Justification**: The monorepo pins Node via `.nvmrc`. No local `engines` field is needed.
- **External value**: `"engines": {"node": ">=22.14.0", "pnpm": ">=11.17.0"}`
- **Adapted value**: No `engines` field; inherited from root `.nvmrc`

### packageManager field

- **Category**: Intégration_Workspace_Monorepo
- **Justification**: Monorepo packages do not declare their own `packageManager`.
- **External value**: `"packageManager": "pnpm@11.17.0"` (external root)
- **Adapted value**: Field omitted; inherited from monorepo root

### Workspace and lockfile

- **Category**: Intégration_Workspace_Monorepo
- **Justification**: The external reference has its own standalone `pnpm-workspace.yaml` and `pnpm-lock.yaml`. This package is integrated into the monorepo workspace.
- **External value**: Standalone workspace config + lockfile
- **Adapted value**: Package registered in monorepo `pnpm-workspace.yaml`; lockfile managed by monorepo root

### Output path

- **Category**: Intégration_Workspace_Monorepo
- **Justification**: The external reference generates to `packages/typescript/src/generated/schemas.ts` (nested within a monorepo). This package generates to `src/generated/schemas.ts` relative to the package root.
- **External value**: `join(repositoryRoot, 'packages', 'typescript', 'src', 'generated', 'schemas.ts')`
- **Adapted value**: `join(packageRoot, 'src', 'generated', 'schemas.ts')`

### Generation command message

- **Category**: Intégration_Workspace_Monorepo
- **Justification**: The external reference uses `mise run generate`. This monorepo uses pnpm scripts.
- **External value**: `Run \`mise run generate\` from the repository root.`
- **Adapted value**: `Run \`pnpm run generate\` from the package root.`
