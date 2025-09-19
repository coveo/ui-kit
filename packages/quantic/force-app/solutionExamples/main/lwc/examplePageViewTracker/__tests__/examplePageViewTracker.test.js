/* eslint-disable @lwc/lwc/no-unexpected-wire-adapter-usages */
/* eslint-disable @lwc/lwc/no-async-operation */
// @ts-ignore
import {createElement} from '@lwc/engine-dom';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';
import ExamplePageViewTracker from 'c/examplePageViewTracker';
import {CurrentPageReference} from 'lightning/navigation';
// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
// @ts-ignore
import getArticleId from '@salesforce/apex/PageViewTrackerHelper.getArticleId';

jest.mock(
  '@salesforce/resourceUrl/coveoua',
  () => ({default: '/resource/coveoua'}),
  {virtual: true}
);

jest.mock(
  'lightning/platformResourceLoader',
  () => ({
    loadScript: jest.fn(() => Promise.resolve()),
  }),
  {virtual: true}
);

jest.mock(
  '@salesforce/apex/HeadlessController.getHeadlessConfiguration',
  () => ({default: jest.fn()}),
  {virtual: true}
);

jest.mock(
  '@salesforce/apex/PageViewTrackerHelper.getArticleId',
  () => ({default: jest.fn()}),
  {virtual: true}
);

jest.mock(
  'lightning/navigation',
  () => {
    const {
      createTestWireAdapter,
    } = require('@salesforce/wire-service-jest-util');
    return {
      CurrentPageReference: createTestWireAdapter(jest.fn()),
    };
  },
  {virtual: true}
);

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const DEFAULT_HEADLESS_CONFIGURATION = {
  organizationId: 'myorg',
  accessToken: 'abc123',
};
const DEFAULT_KAV_ID = 'ka0XX0000000001AAA';

describe('c-example-page-view-tracker', () => {
  beforeEach(() => {
    window.coveoua = jest.fn();

    getHeadlessConfiguration.mockResolvedValue(
      JSON.stringify(DEFAULT_HEADLESS_CONFIGURATION)
    );
    getArticleId.mockResolvedValue(DEFAULT_KAV_ID);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it('loads the external script and initializes Coveo UA on connect', async () => {
    const el = createElement('c-example-page-view-tracker', {
      is: ExamplePageViewTracker,
    });
    document.body.appendChild(el);

    await flushPromises();

    expect(loadScript).toHaveBeenCalledTimes(1);
    // loadScript is called with (this, <resourcePath>), we're just interested in the url part.
    const url = loadScript.mock.calls[0][1];
    expect(url).toBe('/resource/coveoua/coveoua.js');

    expect(window.coveoua).toHaveBeenCalledWith(
      'init',
      'abc123',
      'https://myorg.analytics.org.coveo.com/rest/ua'
    );
  });

  it('sends a view for standard__recordPage using @sfid', async () => {
    const el = createElement('c-example-page-view-tracker', {
      is: ExamplePageViewTracker,
    });
    document.body.appendChild(el);

    await flushPromises();

    const testRecordId = '01t530000004iXsAAI';
    const expectedContentIdKey = '@sfid';

    // @ts-expect-error: in tests, lightning/navigation is mocked to a test adapter with .emit
    CurrentPageReference.emit({
      type: 'standard__recordPage',
      attributes: {recordId: testRecordId, actionName: 'view'},
      state: {recordName: 'Test'},
    });

    await flushPromises();

    // A 'send view' call with @sfid + recordId must be present
    expect(window.coveoua).toHaveBeenCalledWith(
      'send',
      'view',
      expect.objectContaining({
        contentIdKey: expectedContentIdKey,
        contentIdValue: testRecordId,
      })
    );
  });

  it('sends a view for standard__knowledgeArticlePage using resolved article id and contentType=Knowledge', async () => {
    const testKnowledgeArticleId = 'kA01U0000001234UAA';
    // @ts-ignore TS doesn't know about our mock
    getArticleId.mockResolvedValue(testKnowledgeArticleId);

    const el = createElement('c-example-page-view-tracker', {
      is: ExamplePageViewTracker,
    });
    document.body.appendChild(el);

    await flushPromises();

    const testArticleUrlName = 'how-to-reset-password';

    // @ts-expect-error: in tests, lightning/navigation is mocked to a test adapter with .emit
    CurrentPageReference.emit({
      type: 'standard__knowledgeArticlePage',
      attributes: {urlName: testArticleUrlName},
      state: {},
    });

    await flushPromises();

    // Verify Apex call params
    expect(getArticleId).toHaveBeenCalledWith({
      urlName: testArticleUrlName,
    });

    // Verify UA 'send view' with knowledge content
    expect(window.coveoua).toHaveBeenCalledWith(
      'send',
      'view',
      expect.objectContaining({
        contentIdKey: '@sfid',
        contentIdValue: testKnowledgeArticleId,
        contentType: 'Knowledge',
      })
    );
  });

  it('falls back to @clickableuri for non-record/knowledge pages', async () => {
    const el = createElement('c-example-page-view-tracker', {
      is: ExamplePageViewTracker,
    });
    document.body.appendChild(el);

    await flushPromises();

    // @ts-expect-error: in tests, lightning/navigation is mocked to a test adapter with .emit
    CurrentPageReference.emit({
      type: 'standard__namedPage',
      attributes: {pageName: 'home'},
      state: {foo: 'bar'},
    });

    await flushPromises();

    expect(window.coveoua).toHaveBeenCalledWith(
      'send',
      'view',
      expect.objectContaining({
        contentIdKey: '@clickableuri',
        contentIdValue: window.location.href, // jsdom default like http://localhost/
      })
    );
  });
});
