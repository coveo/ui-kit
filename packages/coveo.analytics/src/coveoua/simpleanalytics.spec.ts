import {handleOneAnalyticsEvent} from './simpleanalytics';
import {createAnalyticsClientMock} from '../../tests/analyticsClientMock';
import {EC} from '../plugins/ec';
import {SVC} from '../plugins/svc';
import 'isomorphic-fetch';
import * as fetchMock from 'fetch-mock';
import {TestPlugin} from '../../tests/pluginMock';
import {uuidv4} from '../client/crypto';
import {PluginOptions} from '../plugins/BasePlugin';

jest.mock('../plugins/svc', () => {
    const SVC = jest.fn().mockImplementation(() => {});
    (SVC as any)['Id'] = 'svc';
    return {
        SVC: SVC,
    };
});
jest.mock('../plugins/ec', () => {
    const EC = jest.fn().mockImplementation(() => {});
    (EC as any)['Id'] = 'ec';
    return {
        EC: EC,
    };
});

class TestPluginWithSpy extends TestPlugin {
    public static readonly Id: 'test';
    public static spy: jest.Mock;
    constructor({client, uuidGenerator = uuidv4}: PluginOptions) {
        super({client, uuidGenerator});
        TestPluginWithSpy.spy = jest.fn();
    }
    testMethod(...args: any[]) {
        TestPluginWithSpy.spy(args);
    }
    someProperty: 'foo';
}

describe('simpleanalytics', () => {
    const analyticsClientMock = createAnalyticsClientMock();
    const analyticsEndpoint = 'https://platform.cloud.coveo.com/rest/ua/v15/analytics';
    const someRandomEventName = 'kawabunga';

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.mock('*', {});
        handleOneAnalyticsEvent('reset');
    });

    afterEach(() => {
        fetchMock.reset();
        fetchMock.resetHistory();
        fetchMock.resetBehavior();
    });

    describe('init', () => {
        it('throws when initializing without a token', () => {
            expect(() => handleOneAnalyticsEvent('init')).toThrow(`You must pass your token when you call 'init'`);
        });

        it('throws when initializing with a token that is not a string nor a AnalyticClient', () => {
            expect(() => handleOneAnalyticsEvent('init', {})).toThrow(
                `You must pass either your token or a valid object when you call 'init'`
            );
        });

        it('can initialize with analyticsClient', () => {
            expect(() => handleOneAnalyticsEvent('init', analyticsClientMock)).not.toThrow();
        });

        it('can initialize with a token', () => {
            expect(() => handleOneAnalyticsEvent('init', 'SOME TOKEN')).not.toThrow();
        });

        it('default to platform.cloud.coveo.com when no endpoint is given', async () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN');

            await handleOneAnalyticsEvent('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            const foo = fetchMock.lastUrl();
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/platform\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('default to platform.cloud.coveo.com when the endpoint is an empty string', async () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', '');

            await handleOneAnalyticsEvent('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            const foo = fetchMock.lastUrl();
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/platform\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('default to platform.cloud.coveo.com when an options object is given but does not include an endpoint', async () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', {});

            await handleOneAnalyticsEvent('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/platform\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('default to platform.cloud.coveo.com when an options object is given but the endpoint property is falsy', async () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', {endpoint: ''});

            await handleOneAnalyticsEvent('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/platform\.cloud\.coveo\.com\/rest\/ua/);
        });

        it('uses the endpoint given if its a non-empty string', async () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', 'https://someendpoint.com');

            await handleOneAnalyticsEvent('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/someendpoint\.com/);
        });

        it('uses the endpoint given if the options object include a non-empty string', async () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', {endpoint: 'https://someendpoint.com'});

            await handleOneAnalyticsEvent('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toMatch(/^https:\/\/someendpoint\.com/);
        });

        it('uses EC and SVC plugins by default', () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN');

            expect(SVC).toHaveBeenCalled();
            expect(EC).toHaveBeenCalled();
        });

        it('can accepts no plugins', () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', {plugins: []});

            expect(SVC).not.toHaveBeenCalled();
            expect(EC).not.toHaveBeenCalled();
        });

        it('can accepts one plugin', () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', {plugins: ['svc']});

            expect(SVC).toHaveBeenCalled();
            expect(EC).not.toHaveBeenCalled();
        });

        it('can send pageview with analyticsClient', () => {
            handleOneAnalyticsEvent('init', analyticsClientMock);

            expect(() => handleOneAnalyticsEvent('send', 'pageview')).not.toThrow();
        });
    });

    describe('initForProxy', () => {
        it(`throw if the initForProxy don't receive an endpoint`, () => {
            expect(() => handleOneAnalyticsEvent('initForProxy')).toThrow(
                `You must pass your endpoint when you call 'initForProxy'`
            );
        });

        it(`throw if the initForProxy receive an endpoint that's is not a string`, () => {
            expect(() => handleOneAnalyticsEvent('initForProxy', {})).toThrow(
                `You must pass a string as the endpoint parameter when you call 'initForProxy'`
            );
        });
    });

    describe('send', () => {
        it('throws when not initialized', () => {
            expect(() => handleOneAnalyticsEvent('send')).toThrow(`You must call init before sending an event`);
        });

        it('throws when send is called without any other arguments', () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN');
            expect(() => handleOneAnalyticsEvent('send')).toThrow(
                `You must provide an event type when calling "send".`
            );
        });

        it('can send pageview', async () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN');
            await handleOneAnalyticsEvent('send', 'pageview');

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/pageview`);
        });

        it('can send pageview with customdata', async () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN', {plugins: []});
            await handleOneAnalyticsEvent('send', 'pageview', {somedata: 'asd'});

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/pageview`);
            expect(JSON.parse(fetchMock.lastCall()[1].body.toString())).toEqual({somedata: 'asd'});
        });

        it('can send any event to the endpoint', async () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN');
            await handleOneAnalyticsEvent('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
        });

        it('can send an event with a proxy endpoint', async () => {
            handleOneAnalyticsEvent('initForProxy', 'https://myProxyEndpoint.com');
            await handleOneAnalyticsEvent('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`https://myproxyendpoint.com/rest/v15/analytics/${someRandomEventName}`);
        });
    });

    describe('set', () => {
        it('can set a new parameter', async () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN');
            handleOneAnalyticsEvent('set', 'userId', 'something');
            await handleOneAnalyticsEvent('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(fetchMock.lastCall()[1].body.toString())).toEqual({userId: 'something'});
        });

        it('can set parameters using an object', async () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN');
            handleOneAnalyticsEvent('set', {
                userId: 'something',
            });
            await handleOneAnalyticsEvent('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(fetchMock.lastCall()[1].body.toString())).toEqual({userId: 'something'});
        });
    });

    describe('onLoad', () => {
        it('can execute callback with onLoad event', () => {
            var callback = jest.fn();

            handleOneAnalyticsEvent('onLoad', callback);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('throws when registering an invalid onLoad event', () => {
            expect(() => handleOneAnalyticsEvent('onLoad', undefined)).toThrow();
        });
    });

    describe('provide', () => {
        it('register properly', () => {
            handleOneAnalyticsEvent('provide', 'test', TestPlugin);

            handleOneAnalyticsEvent('init', 'MYTOKEN');

            expect(() => handleOneAnalyticsEvent('require', 'test')).not.toThrow();
        });
    });

    describe('callPlugin', () => {
        it('resolves properly plugin actions', () => {
            handleOneAnalyticsEvent('provide', 'test', TestPluginWithSpy);
            handleOneAnalyticsEvent('init', 'MYTOKEN', {plugins: ['test']});

            handleOneAnalyticsEvent('callPlugin', 'test', 'testMethod', 'foo', 'bar');

            expect(TestPluginWithSpy.spy).toHaveBeenCalledTimes(1);
            expect(TestPluginWithSpy.spy).toHaveBeenCalledWith(['foo', 'bar']);
        });

        it('throws when a namespaced action is called and that the namespace/plugin is not required', () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', {plugins: ['ec']});

            expect(() => handleOneAnalyticsEvent('callPlugin', 'svc', 'setTicket')).toThrow(
                `The plugin "svc" is not required. Check that you required it on initialization.`
            );
        });

        it('throws when a namespaced action is called and that this action does not exists on the plugin', () => {
            handleOneAnalyticsEvent('init', 'SOME TOKEN', {plugins: ['svc']});

            expect(() => handleOneAnalyticsEvent('callPlugin', 'svc', 'fooBarBaz')).toThrow(
                `The function "fooBarBaz" does not exists on the plugin "svc".`
            );
        });

        it('throws when a namespaced action is called and that this action is not a function on the plugin', () => {
            handleOneAnalyticsEvent('provide', 'test', TestPluginWithSpy);

            handleOneAnalyticsEvent('init', 'SOME TOKEN', {plugins: ['test']});

            expect(() => handleOneAnalyticsEvent('callPlugin', 'test', 'someProperty')).toThrow(
                `The function "someProperty" does not exists on the plugin "test".`
            );
        });
    });

    describe('require', () => {
        it('can require a plugin', () => {
            handleOneAnalyticsEvent('provide', 'test', TestPlugin);
            handleOneAnalyticsEvent('init', 'MYTOKEN', {plugins: []});

            expect(() => handleOneAnalyticsEvent('require', 'test')).not.toThrow();
        });

        it('throws if not initialized', () => {
            expect(() => handleOneAnalyticsEvent('require', 'test')).toThrow(
                `You must call init before requiring a plugin`
            );
        });

        it('throws if the plugin is not registered first', () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN', {plugins: []});

            expect(() => handleOneAnalyticsEvent('require', 'test')).toThrow(
                `No plugin named "test" is currently registered. If you use a custom plugin, use 'provide' first.`
            );
        });
    });

    describe('reset', () => {
        it('reset the client', () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN');

            handleOneAnalyticsEvent('reset');

            expect(() => handleOneAnalyticsEvent('send')).toThrow(`You must call init before sending an event`);
        });

        it('reset the plugins', () => {
            const fakePlugin = TestPlugin;
            handleOneAnalyticsEvent('provide', 'test', fakePlugin);
            handleOneAnalyticsEvent('init', 'MYTOKEN', {plugins: ['test']});

            handleOneAnalyticsEvent('reset');

            expect(() => handleOneAnalyticsEvent('init', 'MYTOKEN', {plugins: ['test']})).toThrow(
                `No plugin named "test" is currently registered. If you use a custom plugin, use 'provide' first.`
            );
        });

        it('reset the params', async () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN');
            handleOneAnalyticsEvent('set', 'userId', 'something');

            handleOneAnalyticsEvent('reset');

            handleOneAnalyticsEvent('init', 'MYTOKEN');
            await handleOneAnalyticsEvent('send', someRandomEventName);

            expect(fetchMock.calls().length).toBe(1);
            expect(fetchMock.lastUrl()).toBe(`${analyticsEndpoint}/${someRandomEventName}`);
            expect(JSON.parse(fetchMock.lastCall()[1].body.toString())).toEqual({});
        });
    });

    it('throws when called with an unknown action', () => {
        handleOneAnalyticsEvent('init', 'SOME TOKEN', {plugins: ['svc']});

        expect(() => handleOneAnalyticsEvent('potato')).toThrow(
            `The action "potato" does not exist. Available actions: init, set, send, onLoad, callPlugin, reset, require, provide.`
        );
    });

    it('resolves properly plugin actions', () => {
        handleOneAnalyticsEvent('provide', 'test', TestPluginWithSpy);
        handleOneAnalyticsEvent('init', 'MYTOKEN', {plugins: ['test']});

        handleOneAnalyticsEvent('test:testMethod', 'foo', 'bar');

        expect(TestPluginWithSpy.spy).toHaveBeenCalledTimes(1);
        expect(TestPluginWithSpy.spy).toHaveBeenCalledWith(['foo', 'bar']);
    });
});
