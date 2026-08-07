import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {vi} from 'vitest';
import CoveoAnalyticsClient from '../client/analytics';
import {ReactNativeRuntime} from './react-native-runtime';

describe('ReactNativeRuntime', () => {
  let runtimeEnvironment: ReactNativeRuntime;
  let client: CoveoAnalyticsClient;

  beforeEach(() => {
    runtimeEnvironment = new ReactNativeRuntime({
      storage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    });
    client = new CoveoAnalyticsClient({runtimeEnvironment});
  });

  it('should call "storage.getItem" when getting the visitor ID', async () => {
    vi.spyOn(runtimeEnvironment.storage, 'getItem');
    await client.getCurrentVisitorId();
    expect(runtimeEnvironment.storage.getItem).toHaveBeenCalled();
  });

  it('should call "storage.getItem" when getting the visitor ID', async () => {
    vi.spyOn(runtimeEnvironment.storage, 'setItem');
    await client.setCurrentVisitorId('testVisitorId');
    expect(runtimeEnvironment.storage.setItem).toHaveBeenCalled();
  });
});

describe('react-native entrypoint', () => {
  it('should import the getRandomValues polyfill so that Rollup inlines it into the bundle', () => {
    const entrypoint = readFileSync(resolve(process.cwd(), 'src/react-native/index.ts'), 'utf8');
    expect(entrypoint).toContain("import 'react-native-get-random-values';");
  });
});
