type BaseRaw = {
  urihash: string;
  parents: string;
  sfid: string;
  sfparentid: string;
  sfinsertedbyid: string;
  documenttype: string;
  sfcreatedbyid: string;
  permanentid: string;
  date: number;
  objecttype: string;
  sourcetype: string;
  sftitle: string;
  size: number;
  sffeeditemid: string;
  clickableuri: string;
  sfcreatedby: string;
  source: string;
  collection: string;
  connectortype: string;
  filetype: string;
  sfcreatedbyname: string;
  sflikecount: number;
  language: string[];
};

export type Raw = BaseRaw & Record<string, unknown>;
