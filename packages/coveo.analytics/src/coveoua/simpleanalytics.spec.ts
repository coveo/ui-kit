import * as express from 'express';
import * as http from 'http';
import {handleOneAnalyticsEvent} from './simpleanalytics';
import {Version} from '../client/analytics';
import {createAnalyticsClientMock} from '../../tests/analyticsClientMock';

describe('simpleanalytics', () => {
    const analyticsClientMock = createAnalyticsClientMock();

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
            app.post(
                `/rest/${Version}/analytics/${someRandomEventName}`,
                (req: express.Request, res: express.Response) => {
                    res.status(200).send('{}');
                }
            );
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
            handleOneAnalyticsEvent('send', 'pageview', {somedata: 'asd'});
        });

        it('can send any event to the endpoint', () => {
            handleOneAnalyticsEvent('init', 'MYTOKEN', fakeServerAddress);
            handleOneAnalyticsEvent('send', someRandomEventName);
        });

        it('can send an event with a proxy endpoint', () => {
            handleOneAnalyticsEvent('initForProxy', fakeServerAddress);
            handleOneAnalyticsEvent('send', someRandomEventName);
        });

        it('can set a new parameter', () => {
            handleOneAnalyticsEvent('set', 'userId', 'something');
        });

        it('can set parameters using an object', () => {
            handleOneAnalyticsEvent('set', {
                userId: 'something',
            });
        });
    });

    it('can initialize with analyticsClient', () => {
        handleOneAnalyticsEvent('init', analyticsClientMock);
    });

    it('can send pageview with analyticsClient', () => {
        handleOneAnalyticsEvent('init', analyticsClientMock);
        handleOneAnalyticsEvent('send', 'pageview');
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
