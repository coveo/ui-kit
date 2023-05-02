import {DefaultEventResponse} from '../src/events';
import coveoua from '../src/coveoua/browser';
import {mockFetch} from '../tests/fetchMock';

const {fetchMock, fetchMockBeforeEach} = mockFetch();

describe('svc events', () => {
    const initialLocation = `${window.location}`;
    const aToken = 'token';
    const anEndpoint = 'http://bloup';

    const guidFormat = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

    const defaultContextValues = {
        dl: `${location.protocol}//${location.hostname}${
            location.pathname.indexOf('/') === 0 ? location.pathname : `/${location.pathname}`
        }${location.search}`,
        sr: `${screen.width}x${screen.height}`,
        sd: `${screen.colorDepth}-bit`,
        ul: navigator.language,
        ua: navigator.userAgent,
        dr: document.referrer,
        dt: document.title,
        de: document.characterSet,
        pid: expect.stringMatching(guidFormat),
        cid: expect.stringMatching(guidFormat),
        tm: expect.any(Number),
        z: expect.stringMatching(guidFormat),
    };

    beforeEach(() => {
        fetchMockBeforeEach();

        changeDocumentLocation(initialLocation);
        const address = `${anEndpoint}/rest/ua/v15/analytics/collect`;
        fetchMock.reset();
        fetchMock.post(address, (url, {body}) => {
            const parsedBody = JSON.parse(body!.toString());
            const visitorId = parsedBody.cid;
            return {
                visitId: 'firsttimevisiting',
                visitorId,
            } as DefaultEventResponse;
        });
        coveoua('reset');
        coveoua('init', aToken, anEndpoint);
    });

    it('can send a pageview with a simple action and without ticket data', async () => {
        coveoua('svc:setAction', 'ticket_create_start');

        await coveoua('send', 'pageview');

        const [body] = getParsedBody();
        expect(body).toEqual({
            ...defaultContextValues,
            t: 'pageview',
            svc_action: 'ticket_create_start',
        });
    });

    it('can send an event with a complex action and ticket data', async () => {
        coveoua('svc:setAction', 'ticket_classification_click', {classificationId: 'someId', requestID: 'someReqId'});
        coveoua('svc:setTicket', {
            subject: 'super subject',
            description: 'some description',
            category: 'some smort category',
            custom: {verycustom: 'value'},
        });

        await coveoua('send', 'event');

        const [body] = getParsedBody();
        expect(body).toEqual({
            ...defaultContextValues,
            t: 'event',
            svc_action: 'ticket_classification_click',
            svc_action_data: {classificationId: 'someId', requestID: 'someReqId'},
            svc_ticket_subject: 'super subject',
            svc_ticket_description: 'some description',
            svc_ticket_category: 'some smort category',
            svc_ticket_custom: {verycustom: 'value'},
        });
    });

    it('should remove unknown measurement protocol ticket keys', async () => {
        await coveoua('svc:setTicket', {
            subject: 'super subject',
            description: 'some description',
            category: 'some smort category',
            custom: {verycustom: 'value'},
            unknown: 'ok',
        });

        await coveoua('send', 'event');

        const [body] = getParsedBody();
        expect(body).toEqual({
            ...defaultContextValues,
            t: 'event',
            svc_ticket_subject: 'super subject',
            svc_ticket_description: 'some description',
            svc_ticket_category: 'some smort category',
            svc_ticket_custom: {verycustom: 'value'},
        });
    });

    const getParsedBody = (): any[] => {
        return fetchMock.calls().map(([, {body}]: any) => JSON.parse(body.toString()));
    };

    const changeDocumentLocation = (url: string) => {
        // @ts-ignore
        delete window.location;
        // @ts-ignore
        // Ooommmpf... JSDOM does not support any form of navigation, so let's overwrite the whole thing 💥.
        window.location = new URL(url);
    };
});
