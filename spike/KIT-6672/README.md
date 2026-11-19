# KIT-6672 spike scripts

These are the scripts used to build and measure the prototype described in [FINDINGS.md](../../FINDINGS.md). Run them from the repository root with Node 22 or later.

- `map-imports.mjs <packages/headless> <out.json>`: lists every symbol the `-next` SSR code imports from headless outside `src/ssr-next`, and whether a public entry exports the same declaration.
- `rewrite-imports.mjs <repo root> <report.json>`: rewrites the imports of the files to move. It must run **before** the `git mv`, on an untouched `main`, and it writes `packages/headless/src/ssr-internal.index.ts`.
- `api-parity.mjs <baseline repo> <prototype repo>`: compares the export names and kinds of the old and new SSR entries.
- `measure.mjs <baseline repo> <prototype repo>`: bundles consumer entries with esbuild against both trees and reports sizes and duplication.
- [internal-symbols.md](internal-symbols.md): the per-symbol table and the module-state analysis.
