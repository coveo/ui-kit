import test from 'ava';
import * as analytics from '../src/analytics';
import * as express from 'express';
import * as http from 'http';

var app: express.Application = express();
const server: http.Server = (<any>http).createServer(app).listen();
app.set('port', server.address().port);

test('Analytics: can post a view event', t => {

    const response: analytics.ViewEventResponse = {
        raw: undefined,
        visitId : '123',
        visitorId: '213'
    };

    app.post('/analytics/view', (req, res) => {
        res.status(200).send(JSON.stringify(response));
    });

    const client = new analytics.Client({
        token: 'token',
        endpoint: `http://localhost:${server.address().port}`
    });

    return client.sendViewEvent({location: 'here'}).then((res: analytics.ViewEventResponse) => {
        t.not(res.raw, undefined);
        t.is(res.visitId, response.visitId);
        t.is(res.visitorId, response.visitorId);
    });
});
