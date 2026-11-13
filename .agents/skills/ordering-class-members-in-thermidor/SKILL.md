---
name: ordering-class-members-in-thermidor
description: Orders class members in TypeScript classes within the thermidor package following the established convention. Use when creating new classes, refactoring existing ones, or reviewing class structure in packages/thermidor/src/.
license: Apache-2.0
metadata:
  author: coveo
  version: '1.0'
---

# Ordering Class Members in Thermidor

## When to Apply

Apply this ordering convention when:

- Creating a new TypeScript class in `packages/thermidor/src/`
- Refactoring or reviewing an existing class in the thermidor package
- Adding new members to an existing class

## Convention

All TypeScript classes in the thermidor package must follow this member ordering:

### 1. Static Members

```
├── public static get/set
├── public static readonly
├── public static
├── protected static get/set
├── protected static readonly
├── protected static
├── private static get/set
├── private static readonly
├── private static
├── public static methods
├── protected static methods
└── private static methods
```

### 2. Instance Properties

```
├── public readonly
├── public get/set
├── public
├── protected readonly
├── protected get/set
├── protected
├── private readonly
├── private get/set
└── private
```

### 3. Static Hook

```
└── static {}
```

### 4. Constructor

### 5. Instance Methods

```
├── public
├── protected
└── private
```

## Notes

- Within the same access level and category, group related members logically.
- Private guard/validator helpers (e.g., `#assertNotDisposed()`) go at the end of the private methods section.
- The `static {}` block is placed between properties and constructor because it initializes accessor hooks that reference private fields (which must be declared first).
