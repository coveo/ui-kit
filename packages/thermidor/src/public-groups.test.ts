import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Application} from 'typedoc';
import {expect, it} from 'vitest';

const PACKAGE = fileURLToPath(new URL('..', import.meta.url));

it('keeps every public export in a reference group', {timeout: 60_000}, async () => {
  const app = await Application.bootstrapWithPlugins({
    options: join(PACKAGE, 'typedoc.json'),
    tsconfig: join(PACKAGE, 'tsconfig.typedoc.json'),
    plugin: [],
  });
  const project = await app.convert();
  expect(project?.groups?.map(({title}) => title)).toEqual([
    'Session',
    'Turns',
    'Actions',
    'Surfaces',
    'Requests and initialization',
    'Context',
    'Contracts',
    'Serialization',
  ]);
});
