---
title: Getting Started with Case Assist
group: Getting Started
slug: getting-started/getting-started-case-assist
---
# Getting Started with Case Assist

Case Assist helps you build interfaces that assist agents and users in classifying and resolving cases by suggesting relevant fields and documentation.

## Install via a Package Manager

Install `@coveo/headless` using npm (or any other package manager such as pnpm or yarn):

```bash
npm install @coveo/headless
```

Once installed, you can import from the Case Assist sub-package:

```typescript
import { 
    buildCaseAssistEngine, 
    buildCaseInput, 
    buildDocumentSuggestionList 
} from '@coveo/headless/case-assist';
```

## Use via CDN

If you prefer not to use a package manager, you can load the Case Assist bundle directly from a CDN.

### ES Module

```html
<script type="module">
  import {
    buildCaseAssistEngine,
    buildCaseInput,
    buildDocumentSuggestionList,
  } from 'https://static.cloud.coveo.com/headless/v3/case-assist/headless.esm.js';

  // You can now use the imported functions.
</script>
```

### UMD (Classic Script Tag)

```html
<script src="https://static.cloud.coveo.com/headless/v3/case-assist/headless.js"></script>
<script>
  // All exports are available on the global CoveoHeadlessCaseAssist object.
  const { buildCaseAssistEngine, buildCaseInput, buildDocumentSuggestionList } = CoveoHeadlessCaseAssist;
</script>
```

> [!TIP]
>
> Replace `v3` in the URL with a specific version (for example, `v3.46.0`) to pin your application to a known release.

## Verify Your Installation

The following example builds a Case Assist engine, creates a case input controller, and logs its state.

> [!NOTE]
>
> Case Assist requires valid Coveo organization credentials and a case assist configuration ID. The sample below uses placeholder values and cannot run without replacing them with real values from your Coveo organization.

```typescript
import {
  buildCaseAssistEngine,
  buildCaseInput,
} from '@coveo/headless/case-assist';

const engine = buildCaseAssistEngine({
  configuration: {
    organizationId: '<ORGANIZATION_ID>',
    accessToken: '<ACCESS_TOKEN>',
    caseAssistId: '<CASE_ASSIST_ID>',
  },
});

const caseInput = buildCaseInput(engine, { options: { field: 'subject' } });

caseInput.subscribe(() => {
  console.log('Case input state:', caseInput.state);
});
```

Replace `<ORGANIZATION_ID>`, `<ACCESS_TOKEN>`, and `<CASE_ASSIST_ID>` with values from your Coveo organization.

## Next Steps

Now that Case Assist is installed and running, explore the following resources:

- [Usage](../usage/index.html) — Learn about engines, controllers, and state management.
