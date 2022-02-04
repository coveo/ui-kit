import {existsSync} from 'fs';
import {resolve} from 'path';

it('a parsed_doc.json file exists in dist', () => {
  const path = resolve(__dirname, '../../dist/parsed_doc.json');
  const exists = existsSync(path);
  expect(exists).toBe(true);
});
