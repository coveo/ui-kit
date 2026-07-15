---
'@coveo/headless': patch
---

fix(headless): restore memoization of commerce facet selectors

Rewrote the commerce facet selectors so their reselect input selectors return stable references (or primitives) instead of freshly allocated wrapper objects. This restores effective memoization and removes the dev-mode `inputStabilityCheck` and `identityFunctionCheck` warnings that were previously logged on every selector access. Selector outputs are unchanged.
