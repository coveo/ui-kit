---
"@coveo/headless": patch
---

Only emit browser/Quantic source maps and esbuild metafiles (`*.stats.json`) for CDN builds (`DEPLOYMENT_ENVIRONMENT=CDN`). Regular builds no longer produce them, which keeps the build's Turborepo cache artifact under the remote cache upload limit (see #8541).

As a result the published package no longer ships `dist/quantic/**/*.map` or the `*.stats.json` metafiles. The CDN bundles are unaffected and still include their source maps; the Quantic package re-minifies `dist/quantic` and does not consume these maps.
