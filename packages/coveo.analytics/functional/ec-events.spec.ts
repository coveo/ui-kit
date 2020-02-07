import 'isomorphic-fetch';
import * as fetchMock from 'fetch-mock';
import { DefaultEventResponse } from '../src/events';
import coveoua from '../src/coveoua/browser';

describe('ec events', () => {
    const aToken = 'token';
    const anEndpoint = 'http://bloup';
    const aVisitorId = '123';

    const defaultContextValues = {
        cid: '',
        dl: `${location.protocol}//${location.hostname}${location.pathname.indexOf('/') === 0 ? location.pathname : `/${location.pathname}`}${location.search}`,
        sr: `${screen.width}x${screen.height}`,
        sd: `${screen.colorDepth}-bit`,
        ul: navigator.language,
        ua: navigator.userAgent,
        dr: document.referrer,
        dt: document.title,
        de: document.characterSet,
    };

    beforeEach(() => {
        const address = `${anEndpoint}/rest/v15/analytics/collect`;
        const eventResponse: DefaultEventResponse = {
            visitId : 'firsttimevisiting',
            visitorId: aVisitorId
        };
        fetchMock.reset();
        fetchMock.post(address, eventResponse);
        fetchMock.post(`${address}?visitor=${aVisitorId}`, eventResponse);
    });

    it('can send a product detail view event', async () => {
        coveoua('init', aToken, anEndpoint);
        coveoua('ec:addProduct', {name: 'wow', id: 'something', brand: 'brand', custom: 'ok'});
        coveoua('ec:setAction', 'detail', {storeid: 'amazing'});
        await coveoua('send', 'pageview');

        assertRequestSentContainsEqual({
            ...defaultContextValues,
            pr1nm: 'wow',
            pr1id: 'something',
            pr1br: 'brand',
            pr1custom: 'ok',
            pa: 'detail',
            storeid: 'amazing',
        });
    });

    it('can send a pageview event with options', async () => {
        coveoua('init', aToken, anEndpoint);
        await coveoua('send', 'pageview', 'page', {
            title: 'wow',
            location: 'http://right.here',
        });

        assertRequestSentContainsEqual({
            ...defaultContextValues,
            page: 'page',
            title: 'wow',
            location: 'http://right.here'
        });
    });

    const assertRequestSentContainsEqual = (toContain: {[name: string]: any}) => {
        expect(fetchMock.called()).toBe(true);

        const [, { body }] = fetchMock.lastCall();
        expect(body).not.toBeUndefined();

        const parsedBody = JSON.parse(body.toString());
        Object.keys((key: string) => expect(parsedBody).toContainEqual({
            [key]: toContain[key]
        }));
    };
});
