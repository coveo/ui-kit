# Reproducing Chromatic Build Traces

Use the bundled script when a user provides a Chromatic build number:

```sh
node .agents/skills/diagnosing-chromatic-turbosnap/scripts/trace-chromatic-build.mjs 1498
```

The script follows this chain without requiring a pre-known commit or Actions run:

1. Fetches the public Chromatic build page at `appId=6a21d979211635c803fe5006` and extracts the GitHub commit SHA.
2. Uses `gh api` to retrieve Actions runs for that SHA.
3. Finds the `Run Chromatic visual tests on Atomic` job in every candidate run.
4. Downloads each candidate job log and extracts TurboSnap diagnostics, including missing commits, fallback builds, changed Storybook files, build initialization, and skip mode.
5. Reads GitHub commit statuses to retrieve `UI Tests` and `Storybook Publish` URLs.
6. Appends `.chromatic/` to every published Storybook URL.

## Requirements

- Network access to Chromatic's public build page.
- An authenticated `gh` CLI with access to `coveo/ui-kit` Actions logs and commit statuses.
- Node.js 18 or later.

## Output interpretation

`candidates` contains every Actions run for the commit with a Chromatic job. Prefer the candidate whose `initializesBuild` is `true`.

For a `merge_group` skip build, no candidate may initialize the build. In that case, identify the candidate with `skipsBuild: true`; it published required Chromatic statuses but did not run a Storybook build.

`storybookUrls` and `chromaticDiagnosticsUrls` can contain more than one value when a commit was retried or later processed by CD. Match the URL to the `UI Tests` build URL when possible. If GitHub retains only the later status, report the ambiguity instead of claiming a unique static-build URL.

## Access limitation

The derived `/.chromatic/` URL may require Chromatic collaborator access. The script reports the URL even when it cannot retrieve its contents.
