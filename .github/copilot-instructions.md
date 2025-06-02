## When writing unit tests in Atomic:

- Wrap all test cases in a given spec file under a single describe whose description is the name of the atom, molecule, enzyme, or utils file being tested.
- For individual test cases, always use the it Vitest function (not test).
- Always start an it description with should.
- When there is a single behavior to test under a certain condition, use an it with a description in the form of should … when ….
- Where there are multiple behaviors to test under a certain condition, wrap the its in a describe with a description in the form of when ….
- You can nest describe conditions if necessary.
- When mentioning the name of a function, method, class, event, or attribute, in a description, prefix it with # (e.g., #myFunction, #MyClass, etc.).
- When testing a public class method (or an exported util function), wrap all tests for that method or function in a describe with a description in the form of #methodOrFunctionName.
- Explicitly import all Vitest functions you are using in your test suite (e.g., it, describe, beforeEach, etc.).
- When your tests are expected to log errors, warnings, etc., mock the logger to ensure that test logs remain clean.

Atom example

```typescript
// my-atom.spec.ts
import {describe, it} from 'vitest';

describe('#renderMyAtom', () => {
  it('should ...', () => {
    /* ... */
  });
  it('should ... when ...', () => {
    /* ... */
  });
  describe('when ...', () => {
    it('should ...', () => {
      /* ... */
    });
    it('should ...', () => {
      /* ... */
    });
  });
});
```

Molecule example

```typescript
// atomic-my-molecule.spec.ts
import {describe, it} from 'vitest';

describe('atomic-my-molecule', () => {
  it('should ...', () => {
    /* ... */
  });
  it('should ... when ...', () => {
    /* ... */
  });
  describe('when ...', () => {
    it('should ...', () => {
      /* ... */
    });
  });
  describe('#myPublicMethod', () => {
    it('should ...', () => {
      /* ... */
    });
    it('should ... when ...', () => {
      /* ... */
    });
    describe('when ...', () => {
      it('should ...', () => {
        /* ... */
      });
      it('should ...', () => {
        /* ... */
      });
    });
  });
});
```

Enzyme example

```typescript
// my-enzyme.spec.ts
import {describe, it} from 'vitest';

describe('#MyEnzymeClassName', () => {
  it('should ...', () => {
    /* ... */
  });
  it('should ... when ...', () => {
    /* ... */
  });
  describe('when ...', () => {
    it('should ...', () => {
      /* ... */
    });
  });
  describe('#myPublicMethod', () => {
    it('should ...', () => {
      /* ... */
    });
    it('should ... when ...', () => {
      /* ... */
    });
    describe('when ...', () => {
      it('should ...', () => {
        /* ... */
      });
      it('should ...', () => {
        /* ... */
      });
    });
  });
});
```

Utils file example

```typescript
// my-utils-file.spec.ts
describe('my-utils-file', () => {
  describe('#myUtilFunction1', () => {
    it('should ...', () => {
      /* ... */
    });
    it('should ... when ...', () => {
      /* ... */
    });
    describe('when ...', () => {
      it('should ...', () => {
        /* ... */
      });
      it('should ...', () => {
        /* ... */
      });
    });
  });
  describe('#myUtilFunction2', () => {
    it('should ...', () => {
      /* ... */
    });
    it('should ... when ...', () => {
      /* ... */
    });
    describe('when ...', () => {
      it('should ...', () => {
        /* ... */
      });
      it('should ...', () => {
        /* ... */
      });
    });
  });
});
```

To run the tests, use the following command:

```bash
npx vitest --config vitest.config.ts ./src/**/*.spec.ts --run
```

- Replace `./src/**/*.spec.ts` with the path to your test files
- Run in the packages/atomic directory
