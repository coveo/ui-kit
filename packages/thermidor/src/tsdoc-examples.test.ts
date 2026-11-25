import {readFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const SRC = fileURLToPath(new URL('.', import.meta.url));
const PACKAGE = resolve(SRC, '..');
const TYPE_CHECKED = readFileSync(join(SRC, 'tsdoc-examples.test-d.ts'), 'utf8');

function publicModules(file: string, seen = new Set<string>()): Set<string> {
  seen.add(file);
  for (const [, specifier] of readFileSync(file, 'utf8').matchAll(
    /^export\s[^;]*?\sfrom\s+'([^']+)'/gm
  )) {
    const target = (
      specifier.startsWith('@/')
        ? join(PACKAGE, specifier.slice(2))
        : resolve(dirname(file), specifier)
    ).replace(/\.js$/, '.ts');
    if (!seen.has(target)) {
      publicModules(target, seen);
    }
  }
  return seen;
}

function normalize(code: string): string {
  return code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('import '))
    .join('\n');
}

function tsExamples(source: string): string[] {
  const examples: string[] = [];
  for (const [comment] of source.replace(/\r\n?/g, '\n').matchAll(/\/\*\*[\s\S]*?\*\//g)) {
    const text = comment.replace(/^\s*\/?\*+\/?[ ]?/gm, '');
    for (const [, tag] of text.matchAll(/@example\b([\s\S]*?)(?=\n@[a-zA-Z]|$)/g)) {
      for (const [, code] of tag.matchAll(/```ts\n([\s\S]*?)```/g)) {
        examples.push(code);
      }
    }
  }
  return examples;
}

describe('TSDoc examples', () => {
  const examples = [...publicModules(join(SRC, 'index.ts'))].flatMap((file) =>
    tsExamples(readFileSync(file, 'utf8')).map((code) => ({
      file: relative(SRC, file),
      code,
    }))
  );

  it('finds the examples of every public module', () => {
    expect(new Set(examples.map(({file}) => file))).toEqual(
      new Set(['index.ts', join('session', 'create-session.ts'), join('session', 'contracts.ts')])
    );
  });

  it('finds examples with CRLF line endings', () => {
    const source = readFileSync(join(SRC, 'index.ts'), 'utf8');
    const crlfSource = source.replace(/\r\n?/g, '\n').replace(/\n/g, '\r\n');
    expect(tsExamples(crlfSource)).toEqual(tsExamples(source));
  });

  it.each(examples)('type-checks the example in $file', ({code}) => {
    expect(normalize(TYPE_CHECKED)).toContain(normalize(code));
  });
});
