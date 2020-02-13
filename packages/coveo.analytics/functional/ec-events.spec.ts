import 'isomorphic-fetch';
import * as fetchMock from 'fetch-mock';
import { DefaultEventResponse } from '../src/events';
import coveoua from '../src/coveoua/browser';

describe('ec events', () => {
    const initialLocation = `${window.location}`;
    const aToken = 'token';
    const anEndpoint = 'http://bloup';

    const numberFormat = /[0-9]+/;
    const guidFormat = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

    const defaultContextValues = {
        dl: `${location.protocol}//${location.hostname}${location.pathname.indexOf('/') === 0 ? location.pathname : `/${location.pathname}`}${location.search}`,
        sr: `${screen.width}x${screen.height}`,
        sd: `${screen.colorDepth}-bit`,
        ul: navigator.language,
        ua: navigator.userAgent,
        dr: document.referrer,
        dt: document.title,
        de: document.characterSet,
        pid: expect.stringMatching(guidFormat),
        cid: expect.stringMatching(guidFormat),
        tm: expect.stringMatching(numberFormat),
        z: expect.stringMatching(guidFormat),
    };

    beforeEach(() => {
        changeDocumentLocation(initialLocation);
        const address = `${anEndpoint}/rest/v15/analytics/collect`;
        fetchMock.reset();
        fetchMock.post(address, (url, {body}) => {
            const parsedBody = JSON.parse(body.toString());
            const visitorId = parsedBody.cid;
            return {
                visitId : 'firsttimevisiting',
                visitorId,
            } as DefaultEventResponse;
        });
        coveoua('reset');
        coveoua('init', aToken, anEndpoint);
    });

    it('can send a product detail view event', async () => {
        coveoua('ec:addProduct', {name: 'wow', id: 'something', brand: 'brand', custom: 'ok'});
        coveoua('ec:setAction', 'detail', {storeid: 'amazing'});
        await coveoua('send', 'pageview');

        const [body] = getParsedBody();

        expect(body).toEqual({
            ...defaultContextValues,
            t: 'pageview',
            pr1nm: 'wow',
            pr1id: 'something',
            pr1br: 'brand',
            pr1custom: 'ok',
            pa: 'detail',
            storeid: 'amazing',
        });
    });

    it('can send a pageview event with options', async () => {
        await coveoua('send', 'pageview', 'page', {
            title: 'wow',
            location: 'http://right.here',
        });

        const [body] = getParsedBody();

        expect(body).toEqual({
            ...defaultContextValues,
            t: 'pageview',
            dp: 'page',
            dt: 'wow',
            dl: 'http://right.here'
        });
    });

    it('should change the pageViewId only when sending a second page view event', async () => {
        await coveoua('send', 'event');
        await coveoua('send', 'event');
        await coveoua('send', 'pageview');
        await coveoua('send', 'event');
        await coveoua('send', 'pageview');
        await coveoua('send', 'event');

        const [event, secondEvent, pageView, thirdEvent, secondPageView, afterSecondPageView] = getParsedBody();

        [event, secondEvent, pageView, thirdEvent, secondPageView, afterSecondPageView]
            .map(e => e.pid)
            .forEach(pid => expect(pid).toMatch(guidFormat));

        expect(event.pid).toBe(secondEvent.pid);
        expect(event.pid).toBe(pageView.pid);
        expect(event.pid).toBe(thirdEvent.pid);
        expect(event.pid).not.toBe(secondPageView.pid);
        expect(secondPageView.pid).toBe(afterSecondPageView.pid);
    });

    it('should update the current location and referrer on a second page view', async () => {
        const secondLocation = 'http://very.new/';

        await coveoua('send', 'pageview');
        await coveoua('send', 'event', '1');
        changeDocumentLocation(secondLocation);
        await coveoua('send', 'pageview');
        await coveoua('send', 'event', '2');

        const [pageView, afterFirst, secondPageView, afterSecond] = getParsedBody();

        expect(pageView.dl).toBe(initialLocation);
        expect(pageView.dr).toBe(document.referrer);
        expect(afterFirst.dl).toBe(initialLocation);
        expect(afterFirst.dr).toBe(document.referrer);

        expect(secondPageView.dl).toBe(secondLocation);
        expect(secondPageView.dr).toBe(initialLocation);
        expect(afterSecond.dl).toBe(secondLocation);
        expect(afterSecond.dr).toBe(initialLocation);
    });

    it('should update the current location when a pageview is sent with the page parameter and keep it', async () => {
        await coveoua('send', 'pageview', '/page');
        await coveoua('send', 'event', '1');

        const [event, secondEvent] = getParsedBody();

        expect(event.dl).toBe(`${initialLocation}page`);
        expect(secondEvent.dl).toBe(`${initialLocation}page`);
    });

    it('should keep the current location when a pageview is sent with the page parameter', async () => {
        await coveoua('send', 'pageview', '/page');

        const [event] = getParsedBody();

        expect(event.dl).toBe(`${initialLocation}page`);
    });

    it('should be able to set the userId', async () => {
        const aUser = '👴';
        await coveoua('set', 'userId', aUser);
        await coveoua('send', 'pageview');

        const [event] = getParsedBody();

        expect(event).toEqual({
            ...defaultContextValues,
            t: 'pageview',
            uid: aUser
        });
    });

    it('should be able to follow the complete addToCart flow', async () => {
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#add-remove-cart
        const product = {
            'id': 'id',
            'name': 'name',
            'category': 'category',
            'brand': 'brand',
            'variant': 'variant',
            'price': 0,
            'quantity': 0
        };
        await coveoua('set', 'currencyCode', 'EUR');
        await coveoua('ec:addProduct', product);
        await coveoua('ec:setAction', 'add');
        await coveoua('send', 'event', 'UX', 'click', 'add to cart');

        const [event] = getParsedBody();

        // Event directly extracted from `ca.js` with the same sequence of event.
        expect(event).toEqual({
            pid: expect.stringMatching(guidFormat), // Key changed from `a`
            cid: expect.stringMatching(guidFormat),
            cu: 'EUR',
            de: defaultContextValues.de,
            dl: defaultContextValues.dl,
            dr: defaultContextValues.dr,
            dt: defaultContextValues.dt,
            ea: 'click',
            ec: 'UX',
            el: 'add to cart',
            pa: 'add',
            pr1br: product.brand,
            pr1ca: product.category,
            pr1id: product.id,
            pr1nm: product.name,
            pr1va: product.variant,
            pr1pr: product.price,
            pr1qt: product.quantity,
            sd: defaultContextValues.sd,
            sr: defaultContextValues.sr,
            t: 'event',
            // tid: "toosogoogleanalyticsevents0l18in4y", removed, this one is picked up from the `ca("create", TID)` call.
            tm: expect.stringMatching(numberFormat),
            ua: defaultContextValues.ua, // Added
            ul: defaultContextValues.ul,
            // v: 1, removed, we don't send version as of now.
            z: expect.stringMatching(guidFormat)
          });
    });

    const getParsedBody = (): any[] => {
        return fetchMock.calls().map(([, { body }]) => JSON.parse(body.toString()));
    };

    const changeDocumentLocation = (url: string) => {
        delete window.location;
        // @ts-ignore
        // Ooommmpf... JSDOM does not support any form of navigation, so let's overwrite the whole thing 💥.
        window.location = new URL(url);
    };
});
