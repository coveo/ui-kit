# @coveo/atomic-agent-kit

Private tooling that gives coding agents the rules of `@coveo/atomic`. It generates the [Agent Skill](https://agentskills.io) the Atomic package ships at `dist/skills/coveo-atomic`, and checks HTML snippets against the custom elements manifest.

## The skill

`pnpm --filter @coveo/atomic build:agent-kit` runs `atomic-agent-kit generate` from the Atomic package (part of its `build`), which writes:

- `SKILL.md`, from `content/SKILL.md`: how to load and initialize the library, the rules the components enforce, and a table of the areas;
- `references/<area>.md`, from `content/areas/<area>.md` and the manifest: the page skeleton of the area and the list of its components;
- `references/components/<tag>.md`, from `custom-elements.json` and the component's `*.usage.mdx`: usage, attributes, properties, methods, slots, events, CSS parts, custom properties and states.

The kit is generated, never edited by hand: change the component's JSDoc, its usage doc or the files under `content/`. A project that depends on `@coveo/atomic` installs it with `npx skills add ./node_modules/@coveo/atomic/dist/skills/coveo-atomic`, or points its agent at that directory.

## The snippet lint

`src/snippets.mjs` checks HTML against the manifest: every `atomic-*` element and attribute must exist, attribute values must be allowed, named slots must exist on the parent, and item templates must contain a `<template>` and sit in a list that accepts them, as `BaseTemplateController` requires at run time. The `@internal` components, which the manifest leaves out, are accepted but not checked.

It runs over every page of the generated kit here (`src/generate.spec.mjs`), and over every `*.usage.mdx` of Atomic in that package's own tests (`packages/atomic/scripts/usage-docs`), so a wrong snippet fails `pnpm test` instead of reaching the docs site, Context7 or an agent.

## Testing

`pnpm test` runs the specs in Node. They analyze the Atomic sources in memory through `@coveo/atomic-agent-kit/testing`, so they need no build.

## Eval

`pnpm eval` (`evals/run.mjs`) measures what the kit changes for a coding agent. It gives `claude -p` ten page-building tasks (`evals/prompts.mjs`) in a fresh workspace with only the file tools, under three contexts (`evals/arms.mjs`): nothing, the kit as a project skill, and an `AGENTS.md` docs index pointing at the reference pages. Each `index.html` then goes through the snippet lint and a render check (`evals/check.mjs`): Chromium loads the page with the platform API mocked by `@coveo/platform-mock-api`, and the run passes when items render without an `atomic-component-error`. Results are in `evals/RESULTS.md`.

It needs a built kit, the `claude` CLI signed in, and the Chromium that Playwright installs. Options: `--atomic <dir> --runs 3 --arms none,skill,index --prompts all --concurrency 3 --model claude-sonnet-5-5 --budget 1 --out <dir>`; `--report-only` rebuilds `report.md` from the results in `--out`. Every run costs a few cents and keeps its transcript and workspace under `--out`.
