import * as analytics from '../src/analytics';
import * as bodyParser from 'body-parser';
import * as events from '../src/events';
import * as express from 'express';
import * as http from 'http';
import test from 'ava';

var app: express.Application = express();
const server: http.Server = (<any>http).createServer(app).listen();
app.set('port', server.address().port);
app.use(bodyParser.json());
const A_VERSION = 'v1337';

test('Analytics: can post a view event', t => {

    const viewEvent: events.ViewEventRequest = { location: 'here', contentIdKey: 'key', contentIdValue: 'value', language: 'en' };
    const response: events.ViewEventResponse = {
        visitId : '123',
        visitorId: '213'
    };

    app.post(`/rest/${A_VERSION}/analytics/view`, (req: express.Request, res: express.Response) => {
        if (req.header('authorization').indexOf('Bearer ') != 0) {
            res.status(500).send(JSON.stringify({error: 'no auth token were provided'}));
            return;
        }
        if (req.header('content-type').indexOf('application/json') != 0) {
            res.status(500).send(JSON.stringify({error: 'you must provide content-type'}));
            return;
        }

        if (req.body === undefined || req.body.length <= 0) {
            res.status(500).send(JSON.stringify({error: 'no event were sent'}));
            return;
        }

        t.is(req.body.location, viewEvent.location);
        t.is(req.body.contentIdKey, viewEvent.contentIdKey);
        t.is(req.body.contentIdValue, viewEvent.contentIdValue);
        t.is(req.body.language, viewEvent.language);

        res.status(200).send(JSON.stringify(response));
    });

    const client = new analytics.Client({
        token: 'token',
        endpoint: `http://localhost:${server.address().port}`,
        version: A_VERSION
    });

    return client.sendViewEvent(viewEvent).then((res: events.ViewEventResponse) => {
        t.is(res.visitId, response.visitId);
        t.is(res.visitorId, response.visitorId);
    });
});
