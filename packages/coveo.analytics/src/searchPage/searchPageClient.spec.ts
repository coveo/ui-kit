import * as fetchMock from 'fetch-mock';
import { CoveoSearchPageClient } from './searchPageClient'
import { SearchPageEvents } from './searchPageEvents'

describe('SearchPageClient', () => {

    let client: CoveoSearchPageClient

    beforeEach(() => {
        client = initClient()
        fetchMock.mock(/.*/, {
            visitId: 'visit-id',
            visitorId: 'visitor-id',
        });
    })


    afterEach(() => {
        fetchMock.reset();
    })

    const initClient = () => {
        return new CoveoSearchPageClient({}, {
            getBaseMetadata: () => ({ 'foo': 'bar' }),
            getSearchEventRequestPayload: () => ({
                queryText: 'queryText',
                responseTime: 123,
            }),
            getSearchUID: () => 'my-uid'
        })
    }

    const expectMatchPayload = (actionCause: SearchPageEvents, meta = {}) => {
        const [, { body }] = fetchMock.lastCall();
        const customData = { 'foo': 'bar', ...meta }
        expect(JSON.parse(body.toString())).toMatchObject({
            queryText: 'queryText',
            responseTime: 123,
            actionCause,
            customData,
        });
    }

    it('should send proper payload for #interfaceLoad', async () => {
        await client.logInterfaceLoad()
        expectMatchPayload(SearchPageEvents.interfaceLoad);
    })

    it('should send proper payload for #interfaceChange', async () => {
        await client.logInterfaceChange({
            interfaceChangeTo: 'bob'
        })

        expectMatchPayload(SearchPageEvents.interfaceChange, { interfaceChangeTo: 'bob' })
    })

    it('should send proper payload for #didyoumeanAutomatic', async () => {
        await client.logDidYouMeanAutomatic()

        expectMatchPayload(SearchPageEvents.didyoumeanAutomatic)
    })
})