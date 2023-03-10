import {CoveoLinkParam, LinkPlugin} from './link';
import {createAnalyticsClientMock} from '../../tests/analyticsClientMock';
import {v4 as uuidv4} from 'uuid';

function currentSecsSinceEpoch() {
    return Math.floor(Date.now() / 1000);
}

describe('CoveoLinkParam class', () => {
    it('can create a new link using a uuid', () => {
        const uuid = uuidv4();
        const link: CoveoLinkParam = new CoveoLinkParam(uuid, Date.now());
        expect(link.clientId).toBe(uuid);
        expect(link.creationDate).toBe(currentSecsSinceEpoch());
    });

    it('can create a new link using a uuid and timestamp', () => {
        const uuid = uuidv4();
        const link: CoveoLinkParam = new CoveoLinkParam(uuid, 1676298678329);
        expect(link.clientId).toBe(uuid);
        expect(link.creationDate).toBe(1676298678);
    });

    it('can not create a new link using a non uuid', () => {
        const uuid = 'Not_a_uuid';
        expect(() => new CoveoLinkParam(uuid, Date.now())).toThrow('Not a valid uuid');
    });

    it('can parse a link from a string', () => {
        const link = 'c0b48880743e484f8044d7c37910c55b.1676298678';
        const coveoLinkParam: CoveoLinkParam | null = CoveoLinkParam.fromString(link);
        expect(coveoLinkParam).not.toBeNull;
        expect(coveoLinkParam?.clientId).toBe('c0b48880-743e-484f-8044-d7c37910c55b');
        expect(coveoLinkParam?.creationDate).toBe(1676298678);
    });

    it('will not parse links without a valid uuid', () => {
        const link = 'a0c56830743d46537f703.1676298678';
        const coveoLinkParam: CoveoLinkParam | null = CoveoLinkParam.fromString(link);
        expect(coveoLinkParam).toBe(null);
    });

    it('will not parse links with an invalid structure', () => {
        const link = 'a0c56830743d46537f703.1676298678.353673463';
        const coveoLinkParam: CoveoLinkParam | null = CoveoLinkParam.fromString(link);
        expect(coveoLinkParam).toBe(null);
    });

    it('will not parse links with invalid timestamps', () => {
        const link = 'a0c56830743d46537f703.invalidtimestamp';
        const coveoLinkParam: CoveoLinkParam | null = CoveoLinkParam.fromString(link);
        expect(coveoLinkParam).toBe(null);
    });

    it('can serialize a link to a string', () => {
        const coveoLink: CoveoLinkParam = new CoveoLinkParam('074af291-224b-4705-9dc5-a47bd80a8db9', Date.now());
        const link = coveoLink.toString();
        const parts = link.split('.');
        expect(parts[0]).toBe('074af291224b47059dc5a47bd80a8db9');
        expect(Number.parseInt(parts[1])).toBe(currentSecsSinceEpoch());
    });

    it('checks for expiration on a link', () => {
        const coveoLink1: CoveoLinkParam = new CoveoLinkParam('074af291-224b-4705-9dc5-a47bd80a8db9', Date.now());
        expect(coveoLink1.expired).toBe(false);
        const coveoLink2: CoveoLinkParam = new CoveoLinkParam(
            '074af291-224b-4705-9dc5-a47bd80a8db9',
            Date.now() - 180000
        );
        expect(coveoLink2.expired).toBe(true);
    });

    it('checks for expiration on a link if the timestamp is in the future', () => {
        const coveoLink1: CoveoLinkParam = new CoveoLinkParam('074af291-224b-4705-9dc5-a47bd80a8db9', Date.now());
        expect(coveoLink1.expired).toBe(false);
        const coveoLink2: CoveoLinkParam = new CoveoLinkParam(
            '074af291-224b-4705-9dc5-a47bd80a8db9',
            Date.now() + 5000
        );
        expect(coveoLink2.expired).toBe(true);
    });

    it('checks validation on referrers', () => {
        const coveoLink1: CoveoLinkParam = new CoveoLinkParam('074af291-224b-4705-9dc5-a47bd80a8db9', Date.now());
        expect(coveoLink1.validate('http://sub.mysite.com', ['*'])).toBe(true);
        expect(coveoLink1.validate('http://sub.mysite.com', ['*.mysite.com', '*'])).toBe(true);
        expect(coveoLink1.validate('http://sub.mysite.com', ['*.mysite.com'])).toBe(true);
        expect(coveoLink1.validate('http://sub.notmysite.com', ['*.mysite.com'])).toBe(false);
        expect(coveoLink1.validate('http://sub.mysite.com', [])).toBe(false);
    });

    it('escapes backslash correctly', () => {
        const coveoLink1: CoveoLinkParam = new CoveoLinkParam('074af291-224b-4705-9dc5-a47bd80a8db9', Date.now());
        expect(coveoLink1.validate('http://sub.mysite.com', ['\\w'])).toBe(false); // This should not be treated as a \w regexp!
    });
});

describe('CoveoLinkPlugin', () => {
    let link: LinkPlugin;

    beforeEach(() => {
        jest.clearAllMocks();
        const analyticsClient = createAnalyticsClientMock();
        analyticsClient.getCurrentVisitorId = jest.fn(() => Promise.resolve('85698661-efdf-4c6d-9cad-c4632bf81ce3'));
        link = new LinkPlugin({client: analyticsClient});
    });

    it('decorates links with valid urls and no params', async () => {
        const url: string = 'https://coveo.com';
        const result: string = await link.decorate(url);
        expect(result).toBe('https://coveo.com/?cvo_cid=85698661efdf4c6d9cadc4632bf81ce3.' + currentSecsSinceEpoch());
    });

    it('decorates links with valid urls and no params', async () => {
        const url: string = 'https://coveo.com/some/path/';
        const result: string = await link.decorate(url);
        expect(result).toBe(
            'https://coveo.com/some/path/?cvo_cid=85698661efdf4c6d9cadc4632bf81ce3.' + currentSecsSinceEpoch()
        );
    });

    it('decorates links with valid urls and existing params', async () => {
        const url: string = 'https://coveo.com/query?q=something&p=param';
        const result: string = await link.decorate(url);
        expect(result).toBe(
            'https://coveo.com/query?q=something&p=param&cvo_cid=85698661efdf4c6d9cadc4632bf81ce3.' +
                currentSecsSinceEpoch()
        );
    });

    it('decorates links with valid urls, existing params and fragments', async () => {
        const url: string = 'https://coveo.com/?q=something#frag';
        const result: string = await link.decorate(url);
        expect(result).toBe(
            'https://coveo.com/?q=something&cvo_cid=85698661efdf4c6d9cadc4632bf81ce3.' +
                currentSecsSinceEpoch() +
                '#frag'
        );
    });

    it('updates an existing decoration links with valid urls and no params', async () => {
        const url: string = 'https://coveo.com/?cvo_cid=c0b48880743e484f8044d7c37910c55b.1676298678';
        const result: string = await link.decorate(url);
        expect(result).toBe('https://coveo.com/?cvo_cid=85698661efdf4c6d9cadc4632bf81ce3.' + currentSecsSinceEpoch());
    });

    it('errors on invalid urls', async () => {
        const url: string = 'somethingthatisobviouslynotaurl';
        await expect(link.decorate(url)).rejects.toThrow('Invalid URL provided');
    });

    it('errors when there is no current clientId', async () => {
        // initialize with missing clientId method
        const analyticsClient = createAnalyticsClientMock();
        analyticsClient.getCurrentVisitorId = undefined;
        link = new LinkPlugin({client: analyticsClient});

        const url: string = 'https://coveo.com/';
        await expect(link.decorate(url)).rejects.toThrow('Could not retrieve current clientId');
    });

    it('can set a list of referrers on the client', () => {
        const analyticsClient = createAnalyticsClientMock();
        const mock: jest.Mock = jest.fn();
        analyticsClient.setAcceptedLinkReferrers = mock;
        link = new LinkPlugin({client: analyticsClient});
        link.acceptFrom(['*.somedomain.com', 'www.coveo.com']);

        expect(mock).toHaveBeenCalledTimes(1);
    });
});
