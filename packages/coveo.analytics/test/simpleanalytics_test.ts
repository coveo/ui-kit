import test from 'ava';
import simpleanalytics from '../src/simpleanalytics';
import AnalyticsClientMock from './helpers/analyticsclientmock';

import * as express from 'express';
import * as http from 'http';

var app: express.Application = express();
app.post('/analytics/view', (req: express.Request, res: express.Response) => {
    res.status(200).send('{}');
});
const server: http.Server = (<any>http).createServer(app).listen();
app.set('port', server.address().port);

test('SimpleAnalytics: can\'t call without initiating', t => {
    t.throws(() => { simpleanalytics('send'); }, /init/);
});

test('SimpleAnalytics: can\'t init without token', t => {
    t.throws(() => { simpleanalytics('init'); }, /token/);
});

test('SimpleAnalytics: can\'t init with invalid object', t => {
    t.throws(() => { simpleanalytics('init', {}); }, /token/);
});

test('SimpleAnalytics: can send pageview', t => {
    simpleanalytics('init', 'MYTOKEN', `http://localhost:${server.address().port}`);
    simpleanalytics('send', 'pageview');
});

test('SimpleAnalytics: can send pageview with customdata', t => {
    simpleanalytics('init', 'MYTOKEN', `http://localhost:${server.address().port}`);
    simpleanalytics('send', 'pageview', {somedata: 'asd'});
});

test('SimpleAnalytics: can\'t send and unknown event', t => {
    simpleanalytics('init', 'MYTOKEN', `http://localhost:${server.address().port}`);
    t.throws(() => { simpleanalytics('send', 'kawabunga'); }, /not implemented/);
});

test('SimpleAnalytics: can initialize with analyticsClient', t => {
    simpleanalytics('init', new AnalyticsClientMock());
});

test('SimpleAnalytics: can send pageview with analyticsClient', t => {
    var client = new AnalyticsClientMock();
    simpleanalytics('init', client);
    simpleanalytics('send', 'pageview');
});
