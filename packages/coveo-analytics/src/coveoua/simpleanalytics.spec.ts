import coveoua from './simpleanalytics';
import {createAnalyticsClientMock, visitorIdMock} from '../../tests/analyticsClientMock';
import {TestPlugin} from '../../tests/pluginMock';
import {v4 as uuidv4} from 'uuid';
import {PluginOptions} from '../plugins/BasePlugin';
import {mockFetch, lastCallBody} from '../../tests/fetchMock';
import {CookieStorage} from '../storage';
import {libVersion} from '../version';

const uuidv4Mock = jest.fn();
jest.mock('uuid', () => ({v4: () => uuidv4Mock()}));

const {fetchMock, fetchMockBeforeEach} = mockFetch();

class TestPluginWithSpy extends TestPlugin {
    public static readonly Id: 'test';
    public static spy: jest.Mock;
    constructor({client, uuidGenerator = uuidv4}: PluginOptions) {
        super({client, uuidGenerator});
        TestPluginWithSpy.spy = jest.fn();
    }

    public getApi(name: string): Function | null {
        switch (name) {
            case 'testMethod':
                return this.testMethod;
            default:
                return null;
        }
    }

    testMethod(...args: any[]) {
        TestPluginWithSpy.spy(args);
    }
}

describe('simpleanalytics', () => {
    const analyticsClientMock = createAnalyticsClientMock();
    const analyticsEndpoint = 'https://analytics.cloud.coveo.com/rest/ua/v15/analytics';
    const someRandomEventName = 'kawabunga';

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMockBeforeEach();

        new CookieStorage().removeItem('visitorId');
        localStorage.clear();
        fetchMock.mock('*', {});
        uuidv4Mock.mockImplementationOnce(() => visitorIdMock);
        coveoua('reset');
    });

    afterEach(() => {
        fetchMock.reset();
        fetchMock.resetHistory();
        fetchMock.resetBehavior();
    });

    describe('init', () => {
        it('throws when initializing without a token', () => {
            expect(() => coveoua('init')).toThrow(`You must pass your token when you call 'init'`);
        });

        it('throws when initializing with a token that is not a string nor a AnalyticClient', () => {
            expect(() => coveoua('init', {})).toThrow(
                `You must pass either your token or a valid object when you call 'init'`
            );
        });

        it('can initialize with analyticsClient', () => {
            expect(() => coveoua('init', analyticsClientMock)).not.toThrow();
        });

        it('can initialize with a token', () => {
            expect(() => coveoua('init', 'SOME TOKEN')).not.toThrow();
        });

        it('default to analytics.cloud.coveo.com when no endpoint is given', async () => {
            coveoua('init', 'SOME TOKEN');

            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            const foo = fetchMock.lastUrl();
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/analytics\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('default to analytics.cloud.coveo.com when the endpoint is an empty string', async () => {
            coveoua('init', 'SOME TOKEN', '');

            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            const foo = fetchMock.lastUrl();
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/analytics\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('default to analytics.cloud.coveo.com when an options object is given but does not include an endpoint', async () => {
            coveoua('init', 'SOME TOKEN', {});

            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/analytics\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('default to analytics.cloud.coveo.com when an options object is given but the endpoint property is falsy', async () => {
            coveoua('init', 'SOME TOKEN', {endpoint: ''});

            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/analytics\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('uses the endpoint given if its a non-empty string', async () => {
            coveoua('init', 'SOME TOKEN', 'https://someendpoint.com');

            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/someendpoint\.com/);
        });

        it('uses the endpoint given if the options object include a non-empty string', async () => {
            coveoua('init', 'SOME TOKEN', {endpoint: 'https://someendpoint.com'});

            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/someendpoint\.com/);
        });

        it('uses EC, SVC and Link plugins by default', () => {
            coveoua('init', 'SOME TOKEN');
            expect(() => coveoua('callPlugin', 'ec', 'nosuchfunction')).toThrow(/does not exist/);
            expect(() => coveoua('callPlugin', 'svc', 'nosuchfunction')).toThrow(/does not exist/);
            expect(() => coveoua('callPlugin', 'link', 'nosuchfunction')).toThrow(/does not exist/);
        });

        it('can accept no plugins', () => {
            coveoua('init', 'SOME TOKEN', {plugins: []});
            expect(() => coveoua('callPlugin', 'ec', 'nosuchfunction')).toThrow(/is not required/);
            expect(() => coveoua('callPlugin', 'svc', 'nosuchfunction')).toThrow(/is not required/);
            expect(() => coveoua('callPlugin', 'link', 'nosuchfunction')).toThrow(/is not required/);
        });

        it('can accept one plugin', () => {
            coveoua('init', 'SOME TOKEN', {plugins: ['svc']});
            expect(() => coveoua('callPlugin', 'ec', 'nosuchfunction')).toThrow(/is not required/);
            expect(() => coveoua('callPlugin', 'link', 'nosuchfunction')).toThrow(/is not required/);
            expect(() => coveoua('callPlugin', 'svc', 'nosuchfunction')).toThrow(/does not exist/);
        });

        it('can send pageview with analyticsClient', () => {
            coveoua('init', analyticsClientMock);
            expect(() => coveoua('send', 'pageview')).not.toThrow();
        });
    });

    describe('initForProxy', () => {
        it(`throw if the initForProxy don't receive an endpoint`, () => {
            expect(() => coveoua('initForProxy')).toThrow(`You must pass your endpoint when you call 'initForProxy'`);
        });

        it(`throw if the initForProxy receive an endpoint that is not a string`, () => {
            expect(() => coveoua('initForProxy', {})).toThrow(
                `You must pass a string as the endpoint parameter when you call 'initForProxy'`
            );
        });
    });

    describe('send', () => {
        it('throws when not initialized', () => {
            expect(() => coveoua('send')).toThrow(`You must call init before sending an event`);
        });

        it('throws when send is called without any other arguments', () => {
            coveoua('init', 'MYTOKEN');
            expect(() => coveoua('send')).toThrow(`You must provide an event type when calling "send".`);
        });

        it('can send pageview', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/pageview`);
        });

        it('can send pageview with customdata', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            await coveoua('send', 'pageview', {somedata: 'asd'});

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/pageview`);
            expect(JSON.parse(lastCallBody(fetchMock))).toEqual({somedata: 'asd'});
        });

        it('can send view event with clientId', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            await coveoua('send', 'view');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/view?visitor=${visitorIdMock}`);
            expect(JSON.parse(lastCallBody(fetchMock)).clientId).toBe(visitorIdMock);
        });

        it('can send any event to the endpoint', async () => {
            coveoua('init', 'MYTOKEN');
            await coveoua('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
        });

        it('can send an event with a proxy endpoint', async () => {
            coveoua('initForProxy', 'https://myProxyEndpoint.com');
            await coveoua('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`https://myproxyendpoint.com/rest/v15/analytics/${someRandomEventName}`);
        });

        describe('will restrict referrers and url lengths', () => {
            const max: number = 2048;
            const reallyLongPath1: string = 'http://coveo.com/?q=' + 'a'.repeat(max);
            const reallyLongPath2: string = 'http://coveo.com/?q=' + 'b'.repeat(max);
            expect(reallyLongPath1.length).toBeGreaterThan(max);
            expect(reallyLongPath2.length).toBeGreaterThan(max);
            it('does this for pageviews', async () => {
                coveoua('init', 'MYTOKEN');
                await coveoua('send', 'pageview', reallyLongPath1);
                await coveoua('send', 'pageview', reallyLongPath2);
                const body = JSON.parse(lastCallBody(fetchMock));
                expect(body.dr.length).toBeLessThanOrEqual(max);
                expect(body.dl.length).toBeLessThanOrEqual(max);
                expect(body.dp.length).toBeLessThanOrEqual(max);
            });
            it('does this for generic events', async () => {
                coveoua('init', 'MYTOKEN');
                await coveoua('send', 'pageview', reallyLongPath1);
                await coveoua('send', 'pageview', reallyLongPath2);
                await coveoua('send', 'event');
                const body = JSON.parse(lastCallBody(fetchMock));
                expect(body.dr.length).toBeLessThanOrEqual(max);
                expect(body.dl.length).toBeLessThanOrEqual(max);
            });
        });
    });

    describe('set', () => {
        it('can set a new parameter', async () => {
            coveoua('init', 'MYTOKEN');
            coveoua('set', 'userId', 'something');
            await coveoua('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(lastCallBody(fetchMock))).toEqual({userId: 'something'});
        });

        it('can set parameters using an object', async () => {
            coveoua('init', 'MYTOKEN');
            coveoua('set', {
                userId: 'something',
            });
            await coveoua('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(lastCallBody(fetchMock))).toEqual({userId: 'something'});
        });

        it('can set a custom_website parameter on a collect event', async () => {
            coveoua('init', 'MYTOKEN', {plugins: ['ec']});
            coveoua('set', 'custom', {context_website: 'MY_WEBSITE'});
            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(result).toHaveProperty('context_website', 'MY_WEBSITE');
        });

        it('does not set custom parameters which are strings', async () => {
            coveoua('init', 'MYTOKEN', {plugins: ['ec']});
            coveoua('set', 'custom', 'test');
            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(Object.keys(result).length).toBe(11);
        });

        it('does not set custom parameters which are arrays', async () => {
            coveoua('init', 'MYTOKEN', {plugins: ['ec']});
            coveoua('set', 'custom', ['test']);
            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(Object.keys(result).length).toBe(11);
        });

        it('does not set custom parameters which are null', async () => {
            coveoua('init', 'MYTOKEN', {plugins: ['ec']});
            coveoua('set', 'custom', null);
            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(Object.keys(result).length).toBe(11);
        });

        it('does not set custom parameters which are undefined', async () => {
            coveoua('init', 'MYTOKEN', {plugins: ['ec']});
            coveoua('set', 'custom', undefined);
            await coveoua('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(Object.keys(result).length).toBe(11);
        });

        it('can set a custom_website parameter on a non-collect event', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            coveoua('set', 'custom', {context_website: 'MY_WEBSITE'});
            await coveoua('send', 'view', {somedata: 'something'});

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(result).toHaveProperty('somedata', 'something');
            expect(result).toHaveProperty('customData.context_website', 'MY_WEBSITE');
        });

        it('does not add a customData entry for custom params which are null', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            coveoua('set', 'custom', null);
            await coveoua('send', 'view', {somedata: 'something'});

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(result).toHaveProperty('somedata', 'something');
            expect(result).not.toHaveProperty('customData');
        });

        it('does not add a customData entry for custom params which are undefined', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            coveoua('set', 'custom', undefined);
            await coveoua('send', 'view', {somedata: 'something'});

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(result).toHaveProperty('somedata', 'something');
            expect(result).not.toHaveProperty('customData');
        });

        it('does not add a customData entry for customData params which are strings', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            coveoua('set', 'custom', 'test');
            await coveoua('send', 'view', {somedata: 'something'});

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(result).toHaveProperty('somedata', 'something');
            expect(result).not.toHaveProperty('customData');
        });

        it('does not add a customData entry for customData params which are arrays', async () => {
            coveoua('init', 'MYTOKEN', [{plugins: []}]);
            coveoua('set', 'custom', [test]);
            await coveoua('send', 'view', {somedata: 'something'});

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(result).toHaveProperty('somedata', 'something');
            expect(result).not.toHaveProperty('customData');
        });

        it('will not override hardcoded customData parameters', async () => {
            coveoua('init', 'MYTOKEN', {plugins: []});
            coveoua('set', 'custom', {context_website: 'MY_WEBSITE'});
            await coveoua('send', 'view', {somedata: 'something', customData: {context_website: 'MY_OTHER_WEBSITE'}});

            expect(fetchMock.calls().length).toBe(1);
            let result = JSON.parse(lastCallBody(fetchMock));
            expect(result).toHaveProperty('somedata', 'something');
            expect(result).toHaveProperty('customData.context_website', 'MY_OTHER_WEBSITE');
        });

        it('can set trackingId', async () => {
            const trackingId = 'yourbestfriend';
            coveoua('init', 'MYTOKEN');
            coveoua('set', 'trackingId', trackingId);
            await coveoua('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(lastCallBody(fetchMock))).toHaveProperty('trackingId', trackingId);
        });

        it('context_website does not overwrite trackingId', async () => {
            const trackingId = 'yourbestfriend';
            const contextWebsite = 'yoursite';
            coveoua('init', 'MYTOKEN');
            coveoua('set', 'custom', {context_website: contextWebsite});
            coveoua('set', 'trackingId', trackingId);
            await coveoua('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(lastCallBody(fetchMock))).toHaveProperty('trackingId', trackingId);
        });
    });

    describe('onLoad', () => {
        it('can execute callback with onLoad event', () => {
            var callback = jest.fn();

            coveoua('onLoad', callback);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('throws when registering an invalid onLoad event', () => {
            expect(() => coveoua('onLoad', undefined)).toThrow();
        });
    });

    describe('provide', () => {
        it('register properly', () => {
            coveoua('provide', 'test', TestPlugin);

            coveoua('init', 'MYTOKEN');

            expect(() => coveoua('require', 'test')).not.toThrow();
        });
    });

    describe('version', () => {
        it('returns the current version string', () => {
            coveoua('init', 'MYTOKEN');
            expect(coveoua('version')).toBe(libVersion);
        });
    });

    describe('callPlugin', () => {
        it('resolves properly plugin actions', () => {
            coveoua('provide', 'test', TestPluginWithSpy);
            coveoua('init', 'MYTOKEN', {plugins: ['test']});

            coveoua('callPlugin', 'test', 'testMethod', 'foo', 'bar');

            expect(TestPluginWithSpy.spy).toHaveBeenCalledTimes(1);
            expect(TestPluginWithSpy.spy).toHaveBeenCalledWith(['foo', 'bar']);
        });

        it('throws when a namespaced action is called and that the namespace/plugin is not required', () => {
            coveoua('init', 'SOME TOKEN', {plugins: ['ec']});

            expect(() => coveoua('callPlugin', 'svc', 'setTicket')).toThrow(/is not required/);
        });

        it('throws when a namespaced action is called and that this action does not exists on the plugin', () => {
            coveoua('init', 'SOME TOKEN', {plugins: ['svc']});

            expect(() => coveoua('callPlugin', 'svc', 'fooBarBaz')).toThrow(/does not exist/);
        });
    });

    describe('require', () => {
        it('can require a plugin', () => {
            coveoua('provide', 'test', TestPlugin);
            coveoua('init', 'MYTOKEN', {plugins: []});

            expect(() => coveoua('require', 'test')).not.toThrow();
        });

        it('throws if not initialized', () => {
            expect(() => coveoua('require', 'test')).toThrow(`You must call init before requiring a plugin`);
        });

        it('throws if the plugin is not registered first', () => {
            coveoua('init', 'MYTOKEN', {plugins: []});

            expect(() => coveoua('require', 'test')).toThrow(
                `No plugin named "test" is currently registered. If you use a custom plugin, use 'provide' first.`
            );
        });
    });

    describe('reset', () => {
        it('reset the client', () => {
            coveoua('init', 'MYTOKEN');

            coveoua('reset');

            expect(() => coveoua('send')).toThrow(`You must call init before sending an event`);
        });

        it('reset the plugins', () => {
            const fakePlugin = TestPlugin;
            coveoua('provide', 'test', fakePlugin);
            coveoua('init', 'MYTOKEN', {plugins: ['test']});

            coveoua('reset');

            expect(() => coveoua('init', 'MYTOKEN', {plugins: ['test']})).toThrow(
                `No plugin named "test" is currently registered. If you use a custom plugin, use 'provide' first.`
            );
        });

        it('reset the params', async () => {
            coveoua('init', 'MYTOKEN');
            coveoua('set', 'userId', 'something');

            coveoua('reset');

            coveoua('init', 'MYTOKEN');
            await coveoua('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(lastCallBody(fetchMock))).toEqual({});
        });
    });

    it('throws when called with an unknown action', () => {
        coveoua('init', 'SOME TOKEN', {plugins: ['svc']});

        expect(() => coveoua('potato')).toThrow(
            `The action "potato" does not exist. Available actions: init, set, send, onLoad, callPlugin, reset, require, provide, version.`
        );
    });

    it('resolves properly plugin actions', () => {
        coveoua('provide', 'test', TestPluginWithSpy);
        coveoua('init', 'MYTOKEN', {plugins: ['test']});

        coveoua('test:testMethod', 'foo', 'bar');

        expect(TestPluginWithSpy.spy).toHaveBeenCalledTimes(1);
        expect(TestPluginWithSpy.spy).toHaveBeenCalledWith(['foo', 'bar']);
    });
});
