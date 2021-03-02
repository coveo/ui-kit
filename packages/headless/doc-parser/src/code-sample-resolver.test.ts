import {resolveCodeSamplePaths} from './code-sample-resolver';
import {readFileSync} from 'fs';
import {resolve} from 'path';

describe('#resolveCodeSamplePaths', () => {
  it("#github.owner is 'coveo'", () => {
    const config = resolveCodeSamplePaths({});
    expect(config.githubInfo.owner).toBe('coveo');
  });

  it("#github.repo is 'ui-kit'", () => {
    const config = resolveCodeSamplePaths({});
    expect(config.githubInfo.repo).toBe('ui-kit');
  });

  it('#github.ref matches the headless package.json version prefixed by a #v', () => {
    const config = resolveCodeSamplePaths({});
    const path = resolve(__dirname, '../../package.json');
    const file = JSON.parse(readFileSync(path, 'utf-8'));

    expect(config.githubInfo.ref).toBe(`v${file.version}`);
  });

  it('when specifying an invalid path, it throws', () => {
    const path = 'non-existant-sample.tsx';
    expect(() => resolveCodeSamplePaths({react_class: [path]})).toThrow();
  });

  describe('with a valid file path in the #react_class parameter', () => {
    function getValidSampleConfig() {
      const path =
        'packages/samples/headless-react/src/components/pager/pager.class.tsx';
      return resolveCodeSamplePaths({react_class: [path]});
    }

    it('resolves the code', () => {
      const config = getValidSampleConfig();
      expect(config.samples.react.class[0].code).toBeTruthy();
    });

    it('provides the absolute path to the sample', () => {
      const config = getValidSampleConfig();
      expect(config.samples.react.class[0].path).toBe(
        'packages/samples/headless-react/src/components/pager/pager.class.tsx'
      );
    });

    it('provides the filename', () => {
      const config = getValidSampleConfig();
      expect(config.samples.react.class[0].fileName).toBe('pager.class.tsx');
    });
  });
});
