---
name: running-quantic-e2e-tests
description: Use whenever changing anything in packages/quantic, whether or not new e2e tests are being written — this applies even if you conclude no new e2e coverage is needed, since existing specs still need to be re-verified. Sets up the Salesforce scratch orgs Quantic e2e tests require, deploys local changes to them, and runs the Playwright specs with a fast iteration loop and a full sanity pass. Also use whenever an e2e run fails for reasons that look environmental.
---

# Running Quantic e2e Tests

Quantic e2e tests run Playwright against real Salesforce scratch orgs hosting the example communities. They are runnable locally.

Every command below runs from `packages/quantic`, except the setup script, which works from anywhere in the repo.

## 1. Ensure the environment

```bash
./.agents/skills/running-quantic-e2e-tests/scripts/ensure-e2e-orgs.sh
```

Run this before touching e2e. It is a no-op of a couple of seconds when things are already in place, so there is no reason to skip it.

It verifies two things per org, both required:

| Requirement | Why |
|---|---|
| The org exists (`Quantic__LWS_enabled`, `Quantic__LWS_disabled`) | Hosts the example community the tests drive |
| `.env/<alias>.env` contains `<alias>_URL` | `playwright.config.ts` reads it for `baseURL`. Without it every spec fails as if the tests were broken |

If anything is missing it runs `pnpm run setup:examples`, which creates both scratch orgs, deploys the components and publishes the example communities. That takes several minutes. It then re-verifies and fails loudly.

Exit codes: `0` ready, `1` not ready with the reason, `2` run from outside the repo.

## 2. Iterate on the quick loop

While developing, keep the loop narrow. Deploy only what you changed, and run only the tests that cover it.

**Deploy just the path you touched.** `-d` accepts any path under `force-app`, and a single-component deploy takes seconds where a full deploy takes minutes:

```bash
sf project deploy start -d ./force-app/main/default/lwc/quanticGeneratedAnswerBody -o Quantic__LWS_enabled
```

Deploy every path your change touched, not only the component: a new custom label, an example component or an example community page each need their own path deployed before a spec can reach them.

**Run the narrowest useful test.** Start from the specific behaviour you altered, widen as it goes green:

```bash
# one describe or test title
npx playwright test quanticLoadMoreResults.e2e.ts --project=LWS-enabled -g "load more button"

# the component's whole spec
npx playwright test quanticLoadMoreResults.e2e.ts --project=LWS-enabled
```

One project at a time while iterating. Two projects doubles the runtime for feedback you do not need yet.

## 3. Finish on the slow loop

Once the work is done, run the full pass as a sanity check. Narrow runs prove the change; the full pass proves you broke nothing.

```bash
pnpm run deploy:lws-enabled
pnpm run deploy:lws-disabled

npx playwright test          # both projects, whole suite
```

`pnpm run deploy:lws-*` deploys the main source and the examples together, which also catches anything the targeted deploys missed.

LWS enabled and disabled are genuinely different runtimes. A component that passes in one can fail in the other, so a change is not verified until both are green.

## Troubleshooting

Work down this table before editing test code.

| Symptom | Likely cause |
|---|---|
| Every spec fails immediately, no page loads | Missing or empty `.env/<alias>.env`, so `baseURL` is undefined. Re-run the setup script |
| Page loads but the component is absent | Change not deployed to that org. Deploy its path |
| Example route 404s | Example component or community page not deployed |
| Was green, now fails after editing another file | Targeted deploy covered one path but not another you touched |
| Passes on one project, fails on the other | A real LWS difference, not flakiness |
| `setup:examples` fails outright | Dev Hub auth expired (`sf org login web`), or the scratch org limit is reached |

A failure that turns out to be environmental is not a test bug. Fix the environment and re-run before concluding anything about the code.
