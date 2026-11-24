import {Application} from 'typedoc';
import {expect, it} from 'vitest';

it('keeps every public export in a reference group', async () => {
  const app = await Application.bootstrapWithPlugins({});
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
