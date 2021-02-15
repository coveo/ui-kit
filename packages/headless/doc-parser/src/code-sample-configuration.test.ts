import {buildCodeSampleConfiguration} from './code-sample-configuration';
import {readFileSync} from 'fs';
import {resolve} from 'path';

describe('#buildCodeSampleConfiguration', () => {
  it("#github.owner is 'coveo'", () => {
    const config = buildCodeSampleConfiguration({});
    expect(config.githubInfo.owner).toBe('coveo');
  });

  it("#github.repo is 'ui-kit'", () => {
    const config = buildCodeSampleConfiguration({});
    expect(config.githubInfo.repo).toBe('ui-kit');
  });

  it('#github.ref matches the headless package.json version prefixed by a #v', () => {
    const config = buildCodeSampleConfiguration({});
    const path = resolve(__dirname, '../../package.json');
    const file = JSON.parse(readFileSync(path, 'utf-8'));

    expect(config.githubInfo.ref).toBe(`v${file.version}`);
  });

  it('specifying the #react_class parameter places the path under #react.class', () => {
    const path = 'pager/pager.class.tsx';
    const config = buildCodeSampleConfiguration({react_class: [path]});

    expect(config.paths.react.class).toEqual([path]);
  });

  it('specifying the #react_fn parameter places the path under #react.fn', () => {
    const path = 'pager/pager.fn.tsx';
    const config = buildCodeSampleConfiguration({react_fn: [path]});

    expect(config.paths.react.fn).toEqual([path]);
  });
});
