---
"@coveo/create-ui": minor
---

feat(create-ui): add zero-config scaffolding CLI

`npm create @coveo/ui <project-name> --template <template-name>` scaffolds a
Coveo UI project by downloading an official sample, resolving its
`catalog:`/`workspace:*` dependencies to concrete versions, and installing.
Runs with no credentials against the sample organization. Headless search and
commerce (React) templates are available first; Atomic and vanilla templates
follow as their samples become scaffold-ready.
