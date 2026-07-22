import {OmniboxSuggestionsMetadata} from '../searchPage/searchPageEvents';
import {formatArrayForCoveoCustomData} from './format-array-for-coveo-custom-data';

export function formatOmniboxMetadata(meta: OmniboxSuggestionsMetadata): OmniboxSuggestionsMetadata {
    const partialQueries =
        typeof meta.partialQueries === 'string'
            ? meta.partialQueries
            : formatArrayForCoveoCustomData(meta.partialQueries);
    const suggestions =
        typeof meta.suggestions === 'string' ? meta.suggestions : formatArrayForCoveoCustomData(meta.suggestions);

    return {
        ...meta,
        partialQueries,
        suggestions,
    };
}
