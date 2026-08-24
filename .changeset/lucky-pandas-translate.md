---
'@coveo/atomic': patch
---

Stop Atomic's own translations from overwriting strings already registered by the consumer.

Atomic loads its translations asynchronously through `i18next-http-backend`. When that load was
driven by i18next's backend connector during `init`, the connector stored the result with a shallow
merge in which the incoming data wins, silently discarding any string an application had already
registered on the interface's i18next instance — for example a customized `load-all-results` label.

Atomic now loads those resources itself with `deep: true, overwrite: false`, the same
non-destructive semantics the language-change path already used, so its strings act as defaults and
consumer customizations win regardless of ordering.
