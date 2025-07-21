import type {Raw} from '../api/search/search/raw.js';

/**
 * For internal use only.
 *
 * Returns the `Raw` property of a `Result`, for testing purposes.
 * @param config - A partial `Raw` property with which to build the target `Raw` property.
 * @returns The new `Raw` property.
 */
export function buildMockRaw(config: Partial<Raw> = {}): Raw {
  return {
    urihash: '',
    parents: '',
    sfid: '',
    sfparentid: '',
    sfinsertedbyid: '',
    documenttype: '',
    sfcreatedbyid: '',
    permanentid: '',
    date: 0,
    objecttype: '',
    sourcetype: '',
    sftitle: '',
    size: 0,
    sffeeditemid: '',
    clickableuri: '',
    sfcreatedby: '',
    source: '',
    collection: '',
    connectortype: '',
    filetype: '',
    sfcreatedbyname: '',
    sflikecount: 0,
    language: [],
    ...config,
  };
}
