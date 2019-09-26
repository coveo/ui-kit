import * as express from 'express';
import * as http from 'http';
import * as sinon from 'sinon';
import AnalyticsClientMock from '../../test/analyticsclientmock';
import test from 'ava';
import { handleOneAnalyticsEvent } from './simpleanalytics';
import { Version } from '../client/analytics';

const someRandomEventName = 'kawabunga';

const app: express.Application = express();
app.post(`/rest/${Version}/analytics/view`, (req: express.Request, res: express.Response) => {
    res.status(200).send('{}');
});
app.post(`/rest/${Version}/analytics/${someRandomEventName}`, (req: express.Request, res: express.Response) => {
    res.status(200).send('{}');
});
const server: http.Server = (<any>http).createServer(app).listen();
app.set('port', server.address().port);

let analyticsClientMock: AnalyticsClientMock;

test.beforeEach(() => {
    analyticsClientMock = new AnalyticsClientMock();
});

test('SimpleAnalytics: can\'t call without initiating', t => {
    t.throws(() => { handleOneAnalyticsEvent('send'); }, /init/);
});

test('SimpleAnalytics: can\'t init without token', t => {
    t.throws(() => { handleOneAnalyticsEvent('init'); }, /token/);
});

test('SimpleAnalytics: can\'t init with invalid object', t => {
    t.throws(() => { handleOneAnalyticsEvent('init', {}); }, /token/);
});

test('SimpleAnalytics: can send pageview', t => {
    handleOneAnalyticsEvent('init', 'MYTOKEN', `http://localhost:${server.address().port}`);
    handleOneAnalyticsEvent('send', 'pageview');
});

test('SimpleAnalytics: can send pageview with customdata', t => {
    handleOneAnalyticsEvent('init', 'MYTOKEN', `http://localhost:${server.address().port}`);
    handleOneAnalyticsEvent('send', 'pageview', { somedata: 'asd' });
});

test('SimpleAnalytics: can send any event to the endpoint', t => {
    handleOneAnalyticsEvent('init', 'MYTOKEN', `http://localhost:${server.address().port}`);
    handleOneAnalyticsEvent('send', someRandomEventName);
});

test('SimpleAnalytics: can send an event with a proxy endpoint', t => {
    handleOneAnalyticsEvent('initForProxy', `http://localhost:${server.address().port}`);
    handleOneAnalyticsEvent('send', someRandomEventName);
});

test('SimpleAnalytics: can initialize with analyticsClient', t => {
    handleOneAnalyticsEvent('init', analyticsClientMock);
});

test('SimpleAnalytics: can send pageview with analyticsClient', t => {
    handleOneAnalyticsEvent('send', 'pageview');
});

test('SimpleAnalytics: can send pageview with content attributes', t => {
    let spy = sinon.spy(analyticsClientMock, 'sendViewEvent');

    handleOneAnalyticsEvent('init', analyticsClientMock);
    handleOneAnalyticsEvent('send', 'pageview', {
        contentIdKey: 'key',
        contentIdValue: 'value',
        contentType: 'type'
    });

    t.is(spy.getCall(0).args[0]['contentIdKey'], 'key');
    t.is(spy.getCall(0).args[0]['contentIdValue'], 'value');
    t.is(spy.getCall(0).args[0]['contentType'], 'type');
});

test('SimpleAnalytics: can send pageview without sending content attributes in the customdata', t => {
    let spy = sinon.spy(analyticsClientMock, 'sendViewEvent');

    handleOneAnalyticsEvent('init', analyticsClientMock);
    handleOneAnalyticsEvent('send', 'pageview', {
        contentIdKey: 'key',
        contentIdValue: 'value',
        contentType: 'type',
        otherData: 'data'
    });

    t.is(spy.getCall(0).args[0]['customData']['contentIdKey'], undefined);
    t.is(spy.getCall(0).args[0]['customData']['contentIdValue'], undefined);
    t.is(spy.getCall(0).args[0]['customData']['contentType'], undefined);
    t.is(spy.getCall(0).args[0]['customData']['otherData'], 'data');
});

test('SimpleAnalytics: can execute callback with onLoad event', t => {
    var numberOfTimesExecuted = 0;
    var callback = () => numberOfTimesExecuted++;

    handleOneAnalyticsEvent('onLoad', callback);

    t.is(numberOfTimesExecuted, 1);
});

test('SimpleAnalytics: can\'t register an invalid onLoad event', t => {
    t.throws(() => handleOneAnalyticsEvent('onLoad', undefined));
});
