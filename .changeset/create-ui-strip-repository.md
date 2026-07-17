---
'@coveo/create-ui': patch
---

Strip the `repository` field when scaffolding a project. Published samples now declare the `coveo/ui-kit` repository (required for npm provenance), and that URL must not carry over into a user's standalone project.
