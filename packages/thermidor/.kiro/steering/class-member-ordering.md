---
inclusion: fileMatch
fileMatchPattern: 'packages/thermidor/src/**/*.ts'
---

# Class Member Ordering

All TypeScript classes in the thermidor package must follow this member ordering convention:

## Static

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

## Properties

```
├── public get/set
├── public readonly
├── public
├── protected get/set
├── protected readonly
├── protected
├── private get/set
├── private readonly
└── private
```

## Static Hook

```
└── static {}
```

## Constructor

## Methods

```
├── public
├── protected
└── private
```

## Notes

- The `static {}` block is placed between private properties and the constructor. It initializes module-scoped accessor hooks (e.g., `getInterfaceInternals`, `getComposedInternals`, `getFullEngine`) following the ADR-005 pattern.
- Private helper methods like `#assertNotDisposed()` go at the end with other private methods.
- Within the same access level and category, group related members together logically.
