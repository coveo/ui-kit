import test from 'ava';
import * as analytics from '../src/analytics';
import * as events from '../src/events';
import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';

var app: express.Application = express();
const server: http.Server = (<any>http).createServer(app).listen();
app.set('port', server.address().port);
app.use(bodyParser.json());
const A_VERSION = 'v1337';

test('Analytics: can post a view event', t => {

    const viewEvent: events.ViewEventRequest = {location: 'here'};
    const response: events.ViewEventResponse = {
        raw: undefined,
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

        res.status(200).send(JSON.stringify(response));
    });

    const client = new analytics.Client({
        token: 'token',
        endpoint: `http://localhost:${server.address().port}`,
        version: A_VERSION
    });

    return client.sendViewEvent(viewEvent).then((res: events.ViewEventResponse) => {
        t.not(res.raw, undefined);
        t.is(res.visitId, response.visitId);
        t.is(res.visitorId, response.visitorId);
    });
});
