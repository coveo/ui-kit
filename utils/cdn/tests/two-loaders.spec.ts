import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {serveCdnAsIs, stopServingCdnAsIs} from './serve-cdn-as-is.js';

interface RecordedPage extends Window {
  defineCalls: Record<string, number>;
  registrationErrors: string[];
  litElementVersions?: string[];
}

const scriptTag = '<script type="module" src="/atomic/v3/atomic.esm.js"></script>';

const loaderCallFrom = (file: string) => `<script type="module">
  import {defineCustomElements} from '/atomic/v3/${file}';
  defineCustomElements();
</script>`;

const recorder = `<script>
  window.defineCalls = {};
  window.registrationErrors = [];
  const define = customElements.define.bind(customElements);
  customElements.define = (tagName, ...rest) => {
    window.defineCalls[tagName] = (window.defineCalls[tagName] ?? 0) + 1;
    return define(tagName, ...rest);
  };
  const error = console.error.bind(console);
  console.error = (...args) => {
    if (String(args[0]).startsWith('[Atomic] Failed to register')) {
      window.registrationErrors.push(String(args[0]));
    }
    error(...args);
  };
</script>`;

const markup = `<atomic-search-interface>
  <atomic-search-box></atomic-search-box>
  <atomic-query-summary></atomic-query-summary>
  <atomic-result-list></atomic-result-list>
</atomic-search-interface>`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('CDN pages that run two loaders', () => {
  let frame: HTMLIFrameElement | undefined;

  const openPage = async (scripts: string[]) => {
    const iframe = document.createElement('iframe');
    iframe.srcdoc = `<!doctype html><html><head>${recorder}${scripts.join('\n')}</head><body>${markup}</body></html>`;
    const loaded = new Promise((resolve) => iframe.addEventListener('load', resolve, {once: true}));
    document.body.append(iframe);
    frame = iframe;
    await loaded;
    return iframe.contentWindow as RecordedPage;
  };

  const isDefinedWithin = (page: RecordedPage, tagName: string, timeoutMs: number) =>
    Promise.race([
      page.customElements.whenDefined(tagName).then(() => true),
      sleep(timeoutMs).then(() => false),
    ]);

  beforeEach(async () => {
    await serveCdnAsIs({delayAtomicChunksMs: 300});
  });

  afterEach(async () => {
    await stopServingCdnAsIs();
    frame?.remove();
  });

  it.each([
    ['the script tag, then a loader call from index.js', [scriptTag, loaderCallFrom('index.js')]],
    ['a loader call from index.js, then the script tag', [loaderCallFrom('index.js'), scriptTag]],
    [
      'the script tag, then a loader call from index.esm.js',
      [scriptTag, loaderCallFrom('index.esm.js')],
    ],
    [
      'a loader call from index.esm.js, then the script tag',
      [loaderCallFrom('index.esm.js'), scriptTag],
    ],
    [
      'loader calls from index.js and index.esm.js',
      [loaderCallFrom('index.js'), loaderCallFrom('index.esm.js')],
    ],
  ])(
    'should register each component once with %s',
    async (_, scripts) => {
      const page = await openPage(scripts);

      expect(
        await isDefinedWithin(page, 'atomic-result-list', 5000),
        'atomic-result-list is defined'
      ).toBe(true);
      await sleep(1500);

      const tagsDefinedTwice = Object.keys(page.defineCalls).filter(
        (tagName) => page.defineCalls[tagName] > 1
      );
      expect(tagsDefinedTwice).toEqual([]);
      expect(page.registrationErrors).toEqual([]);
      expect(page.litElementVersions).toHaveLength(1);
    },
    20_000
  );
});
