import {publint} from 'publint';

const {messages: atomicMessages} = await publint({
  pkgDir: './packages/atomic',
  level: 'warning',
  strict: true,
});

const {messages: headlessMessages} = await publint({
  pkgDir: './packages/atomic',
  level: 'warning',
  strict: true,
});

const {messages: atomicReactMessages} = await publint({
  pkgDir: './packages/atomic',
  level: 'warning',
  strict: true,
});

if (
  atomicMessages.length > 0 ||
  headlessMessages.length > 0 ||
  atomicReactMessages.length > 0
) {
  console.error('publint found issues:', {
    atomic: atomicMessages,
    headless: headlessMessages,
    atomicReact: atomicReactMessages,
  });

  process.exit(1);
} else {
  console.log('No issues found by publint.');
}

// https://www.npmjs.com/package/@arethetypeswrong/cli add
