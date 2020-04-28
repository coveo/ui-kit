import * as fetchMock from 'fetch-mock';
import { CoveoSearchPageClient, SearchPageEvents } from './searchPageClient'

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

    describe('it should send proper payload', () => {

        it('for #interfaceLoad', async () => {
            await client.logInterfaceLoad()
            expectMatchPayload(SearchPageEvents.interfaceLoad);
        })

        it('for #interfaceChange', async () => {
            await client.logInterfaceChange({
                interfaceChangeTo: 'bob'
            })

            expectMatchPayload(SearchPageEvents.interfaceChange, { interfaceChangeTo: 'bob' })
        })

        it('for #didyoumeanAutomatic', async () => {
            await client.logDidYouMeanAutomatic()

            expectMatchPayload(SearchPageEvents.didyoumeanAutomatic)
        })
    })

})