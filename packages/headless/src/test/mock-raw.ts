import {Raw} from '../api/search/search/raw';

/**
 * Returns the `Raw` property of a `Result`.
 * @param config partial `Raw`.
 * @returns the new `Raw`.
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
