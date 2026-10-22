# Agent kit

`pnpm run build:agent-kit` generates an [Agent Skill](https://agentskills.io) for `@coveo/atomic` at `dist/skills/coveo-atomic/`, so that coding agents write markup the components accept:

- `SKILL.md`, from `content/SKILL.md`: how to load and initialize the library, the rules the components enforce, and a table of the areas;
- `references/<area>.md`, from `content/areas/<area>.md` and the manifest: the page skeleton of the area and the list of its components;
- `references/components/<tag>.md`, from `custom-elements.json` and the component's `*.usage.mdx`: usage, attributes, properties, methods, slots, events, CSS parts, custom properties and states.

The kit is generated, never edited by hand: change the component's JSDoc, its usage doc or the files under `content/`.

The task is not part of `build` yet, so the published package has no `dist/skills` folder. Once it is, a project installs the skill with `npx skills add ./node_modules/@coveo/atomic/dist/skills/coveo-atomic`, or points its agent at that directory.

## Usage snippets

`snippets.mjs` checks HTML snippets against the manifest: every `atomic-*` element and attribute must exist, attribute values must be allowed, named slots must exist on the parent, and item templates must contain a `<template>` and sit in a list that accepts them, as `BaseTemplateController` requires at run time. The `@internal` components, which the manifest leaves out, are accepted but not checked.

`usage-docs.spec.mjs` applies it to every `*.usage.mdx`, and `generate.spec.mjs` to every page of the generated kit, so a wrong snippet fails `pnpm test` instead of reaching the docs site, Context7 or an agent.

## Testing

`pnpm run test:agent-kit` runs the specs alone, in Node, without initializing the browser projects of `vitest.config.js`; `pnpm test` runs them with the Atomic unit tests. They analyze the sources in memory, so they need no build.
