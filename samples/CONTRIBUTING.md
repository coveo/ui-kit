# UI-KIT Samples

This guide outlines the conventions and best practices for creating and maintaining samples in the ui-kit repository.

## Overview

The UI-Kit samples are organized into three main entry points that represent the primary ways developers interact with the UI-Kit:

- **`atomic/`** - Samples using Atomic components in every form
- **`headless/`** - Samples using headless controllers for custom UI implementations  
- **`headless-ssr/`** - Samples demonstrating server-side rendering with headless controllers

Sample Organization Structure:

```
samples/
├── atomic/
│   └── ...
├── headless/
│   └── ...
└── headless-ssr/
    └── ...
```

## Naming Convention

All samples follow this standardized naming pattern:

```
<entry-point-folder>/<subpackage-name>-<framework>-<optional-details>
```

### Examples:
- `atomic/commerce-angular` - Atomic commerce components with Angular
- `headless-ssr/search-nextjs-pages-router` - Headless search with Next.js Pages Router
- `atomic/search-react-vite` - Atomic search components with React and Vite

### Guidelines:
- Use **kebab-case** for all folder names
- **Subpackage names**: `commerce`, `search`, `insight`, etc.
- **Framework names**: `react`, `angular`, `vuejs`, `nextjs`, `stencil`, etc.
- **Optional details**: `vite`, `pages-router`, `app-router`, etc.

## Creating a New Sample

### 1. Choose the Correct Entry Point

Determine which entry point best fits your sample:

- **`atomic/`** - If using pre-built UI components from `@coveo/atomic`
- **`headless/`** - If building custom UI with headless controllers from `@coveo/headless`
- **`headless-ssr/`** - If implementing server-side rendering with headless functionality

### 2. Follow the Naming Convention

Create your sample directory following the naming pattern:
```bash
mkdir samples/<entry-point>/<subpackage>-<framework>-<optional-details>
```

### 3. Required Files

#### README.md
Every sample must include a README.md with:
- **Purpose**: Brief description of what the sample demonstrates
- **Prerequisites**: Required tools, versions, or accounts
- **Key Features**: Highlighted functionality or components used
- **Running**: How to start and use the sample


#### Smoke Tests
Include basic tests to verify the sample works correctly:
- Use Playwright
- Have at least one test that verifies the sample loads and renders

## Sample Principles

- **Minimalism**: Include only files necessary for the demonstration
- **Single Purpose**: Focus on one specific use case or functionality
- **Avoid Redundancy**: Don't try to showcase every possible feature
- **Clear Intent**: Make the sample's purpose immediately obvious
- **Well-commented**: Explain complex logic or configuration
- **Idiomatic**: Use framework and library best practices


