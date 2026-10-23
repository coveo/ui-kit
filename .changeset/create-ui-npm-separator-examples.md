---
'@coveo/create-ui': patch
---

Fix the npm examples in `create-ui --help`: with npm, CLI options such as `--template` must come after `--` (`npm create @coveo/ui my-app -- --template <name>`), otherwise npm reads them as its own configuration.
