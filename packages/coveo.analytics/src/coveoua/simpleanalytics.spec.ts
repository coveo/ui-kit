import * as express from 'express';
import * as http from 'http';
import { handleOneAnalyticsEvent } from './simpleanalytics';
import { Version, AnalyticsClient } from '../client/analytics';

describe('simpleanalytics', () => {
    const analyticsClientMock: jest.Mocked<AnalyticsClient> = {
        sendEvent: jest.fn((eventType, payload) => Promise.resolve()),
        sendClickEvent: jest.fn((request) => Promise.resolve()),
        sendCustomEvent: jest.fn((request) => Promise.resolve()),
        sendSearchEvent: jest.fn((request) => Promise.resolve()),
        sendViewEvent: jest.fn((request) => Promise.resolve()),
        getHealth: jest.fn(() => Promise.resolve({status: 'ok'})),
        getVisit: jest.fn(() => Promise.resolve({id: 'a', visitorId: 'ok'})),
    };

    const someRandomEventName = 'kawabunga';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws when not initialized', () => {
        expect(() => handleOneAnalyticsEvent('send')).toThrow();
    });

    it('throws when initializing without a token', () => {
        expect(() => handleOneAnalyticsEvent('init', {})).toThrow();
    });

    describe('with fake server', () => {
        let fakeServerAddress: string;
        let server: http.Server;

        beforeAll((finished) => {
            const app = express();
            app.post(`/rest/${Version}/analytics/view`, (req: express.Request, res: express.Response) => {
                res.status(200).send('{}');
            });
            app.post(`/rest/${Version}/analytics/${someRandomEventName}`, (req: express.Request, res: express.Response) => {
                res.status(200).send('{}');
            });
            server = app.listen('9201', () => {
                const {address, port} = server.address();
                fakeServerAddress = `http://${address}:${port}`;
                finished();
            });
        });

        afterAll(() => {
            server.close();
        });

        it('can send pageview', () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN', fakeServerAddress);
            handleOneAnalyticsEvent('send', 'pageview');
        });

        it('can send pageview with customdata', () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN', fakeServerAddress);
            handleOneAnalyticsEvent('send', 'pageview', { somedata: 'asd' });
        });

        it('can send any event to the endpoint', () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN', fakeServerAddress);
            handleOneAnalyticsEvent('send', someRandomEventName);
        });

        it('can send an event with a proxy endpoint', () => {
            handleOneAnalyticsEvent('initForProxy', fakeServerAddress);
            handleOneAnalyticsEvent('send', someRandomEventName);
        });
    });

    it('can initialize with analyticsClient', () => {
        handleOneAnalyticsEvent('init', analyticsClientMock);
    });

    it('can send pageview with analyticsClient', () => {
        handleOneAnalyticsEvent('init', analyticsClientMock);
        handleOneAnalyticsEvent('send', 'pageview');
    });

    it('can send pageview with content attributes', () => {
        handleOneAnalyticsEvent('init', analyticsClientMock);
        handleOneAnalyticsEvent('send', 'pageview', {
            contentIdKey: 'key',
            contentIdValue: 'value',
            contentType: 'type'
        });

        const eventCall = analyticsClientMock.sendViewEvent.mock.calls[0];

        expect(eventCall[0].contentIdKey).toBe('key');
        expect(eventCall[0].contentIdValue).toBe('value');
        expect(eventCall[0].contentType).toBe('type');
    });

    test('can send pageview without sending content attributes in the customdata', () => {
        handleOneAnalyticsEvent('init', analyticsClientMock);
        handleOneAnalyticsEvent('send', 'pageview', {
            contentIdKey: 'key',
            contentIdValue: 'value',
            contentType: 'type',
            otherData: 'data'
        });

        const eventCall = analyticsClientMock.sendViewEvent.mock.calls[0];

        expect(eventCall[0].customData.contentIdKey).toBeUndefined();
        expect(eventCall[0].customData.contentIdValue).toBeUndefined();
        expect(eventCall[0].customData.contentType).toBeUndefined();
        expect(eventCall[0].customData.otherData).toBe('data');
    });

    test('can execute callback with onLoad event', () => {
        var callback = jest.fn();

        handleOneAnalyticsEvent('onLoad', callback);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('throws when registering an invalid onLoad event', () => {
        expect(() => handleOneAnalyticsEvent('onLoad', undefined)).toThrow();
    });

});
