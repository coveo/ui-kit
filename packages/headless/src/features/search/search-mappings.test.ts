import {
  formatRelativeDateForSearchApi,
  serializeRelativeDate,
} from '../../api/search/date/relative-date';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockDateFacetResponse} from '../../test/mock-date-facet-response';
import {buildMockDateFacetValue} from '../../test/mock-date-facet-value';
import {buildMockSearchRequest} from '../../test/mock-search-request';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {mapSearchRequest, mapSearchResponse} from './search-mappings';

const facetId = 'myfacet';
const relativeStart = serializeRelativeDate({
  period: 'past',
  amount: 2,
  unit: 'year',
});
const relativeEnd = serializeRelativeDate({
  period: 'now',
});
const absoluteStart = formatRelativeDateForSearchApi(relativeStart);
const absoluteEnd = formatRelativeDateForSearchApi(relativeEnd);

const expectedMappings = {
  dateFacetValueMap: {
    [facetId]: {
      [`start${absoluteStart}`]: relativeStart,
      [`end${absoluteEnd}`]: relativeEnd,
    },
  },
};

describe('#mapSearchRequest', () => {
  it('should return the full request along with mappings', () => {
    const originalRequest = buildMockSearchRequest();
    const {request, mappings} = mapSearchRequest(originalRequest);
    expect(mappings).toEqual({
      dateFacetValueMap: {},
    });
    expect(request).toEqual(originalRequest);
  });

  it('should map the dateFacet values', () => {
    const unmappedRequest = buildMockSearchRequest({
      facets: [
        buildMockDateFacetRequest({
          facetId,
          currentValues: [
            {
              start: relativeStart,
              end: relativeEnd,
              state: 'idle',
              endInclusive: false,
            },
          ],
        }),
      ],
    });
    const mappedRequest = buildMockSearchRequest({
      facets: [
        buildMockDateFacetRequest({
          facetId,
          currentValues: [
            {
              start: absoluteStart,
              end: absoluteEnd,
              state: 'idle',
              endInclusive: false,
            },
          ],
        }),
      ],
    });

    const {request, mappings} = mapSearchRequest(unmappedRequest);
    expect(mappings).toEqual(expectedMappings);
    expect(request).toEqual(mappedRequest);
  });
});

describe('#mapSearchResponse', () => {
  it('should return the full response', () => {
    expect(
      mapSearchResponse(
        {success: buildMockSearchResponse()},
        {dateFacetValueMap: {}}
      )
    ).toEqual({success: buildMockSearchResponse()});
  });

  it('should map the dateFacet values', () => {
    expect(
      mapSearchResponse(
        {
          success: buildMockSearchResponse({
            facets: [
              buildMockDateFacetResponse({
                facetId,
                values: [
                  buildMockDateFacetValue({
                    start: absoluteStart,
                    end: absoluteEnd,
                  }),
                ],
              }),
            ],
          }),
        },
        expectedMappings
      )
    ).toEqual({
      success: buildMockSearchResponse({
        facets: [
          buildMockDateFacetResponse({
            facetId,
            values: [
              buildMockDateFacetValue({start: relativeStart, end: relativeEnd}),
            ],
          }),
        ],
      }),
    });
  });
});
