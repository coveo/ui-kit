import {
  generateComponentHTML,
  ResultWithFolding,
  SearchFoldedResponseSuccess,
} from '../../fixtures/test-fixture';

export function withFoldedResult(
  response: SearchFoldedResponseSuccess
): SearchFoldedResponseSuccess {
  response.results[0] = elfCupsAndAllies(opercs, [
    elfCups(elfCupsAndAllies(), [stubbleLichens(pyrenomycetes)]),
  ]);
  return response;
}

const reusableFields = {
  firstSentences: '',
  summary: null,
  flags: 'HasHtmlVersion;SkipSentencesScoring',
  hasHtmlVersion: true,
  percentScore: 100,
  rankingInfo: null,
  isTopResult: false,
  isRecommendation: false,
  titleHighlights: [],
  firstSentencesHighlights: [],
  excerptHighlights: [],
  printableUriHighlights: [],
  summaryHighlights: [],
  absentTerms: [],
};

const reusableRawFields = {
  date: 1648829987000,
  objecttype: 'taxon',
  foldingcollection: 'Pyrenomycetes',
  syssource: 'iNaturalistTaxons',
  sysdate: 1648829987000,
  source: 'iNaturalistTaxons',
  collection: 'default',
  filetype: 'txt',
  sysfiletype: 'txt',
  syscollection: 'default',
};

const elfCups = (
  parentResult: ResultWithFolding,
  childResults: ResultWithFolding[]
) => ({
  title: 'Elf Cups',
  uri: 'https://www.inaturalist.org/taxa/49136',
  printableUri: 'https://www.inaturalist.org/taxa/49136',
  clickUri: 'https://www.inaturalist.org/taxa/49136',
  uniqueId: '42.29355$https://www.inaturalist.org/taxa/49136',
  excerpt: 'Elf Cups',
  score: 6106,
  parentResult,
  childResults,
  ...reusableFields,
  raw: {
    sysurihash: 'knbPBkRAUHLI6KMI',
    urihash: 'knbPBkRAUHLI6KMI',
    permanentid: '5570a7c57da54559b2dde4a1db26c1a9f2b05f277fbb91db49bda76fc8cb',
    foldingchild: ['49136'],
    foldingparent: '49135',
    ...reusableRawFields,
  },
});

const stubbleLichens = (parentResult: ResultWithFolding) => ({
  title: 'Stubble Lichens',
  uri: 'https://www.inaturalist.org/taxa/55457',
  printableUri: 'https://www.inaturalist.org/taxa/55457',
  clickUri: 'https://www.inaturalist.org/taxa/55457',
  uniqueId: '42.29355$https://www.inaturalist.org/taxa/55457',
  excerpt: 'Stubble Lichens',
  score: 6106,
  parentResult,
  childResults: [],
  ...reusableFields,
  raw: {
    sysurihash: 'rb0nRhtU2QuoPðjq',
    urihash: 'rb0nRhtU2QuoPðjq',
    permanentid: '4e74afe76c520b3fdab33397c93e49ebfd413cbc3353438dd3b8f5d82973',
    foldingchild: ['55457'],
    foldingparent: '372740',
    ...reusableRawFields,
  },
});

const opercs = {
  title: 'Opercs',
  uri: 'https://www.inaturalist.org/taxa/152032',
  printableUri: 'https://www.inaturalist.org/taxa/152032',
  clickUri: 'https://www.inaturalist.org/taxa/152032',
  uniqueId: '42.29355$https://www.inaturalist.org/taxa/152032',
  excerpt: 'Opercs',
  score: 0,
  parentResult: null,
  childResults: [],
  ...reusableFields,
  raw: {
    sysurihash: '9eVHlTñobdnyHVSj',
    urihash: '9eVHlTñobdnyHVSj',
    permanentid: 'fa9bae1d4db8d514f43fbc873a384c7085dba7f112b7ada17cea930bb540',
    foldingchild: ['152032'],
    foldingparent: '372740',
    ...reusableRawFields,
  },
};

const elfCupsAndAllies = (
  parentResult: ResultWithFolding | null = null,
  childResults: ResultWithFolding[] = []
) => ({
  title: 'Elf Cups and Allies',
  uri: 'https://www.inaturalist.org/taxa/49135',
  printableUri: 'https://www.inaturalist.org/taxa/49135',
  clickUri: 'https://www.inaturalist.org/taxa/49135',
  uniqueId: '42.29355$https://www.inaturalist.org/taxa/49135',
  excerpt: 'Elf Cups and Allies',
  score: 0,
  parentResult,
  childResults,
  ...reusableFields,
  raw: {
    sysurihash: 'AHMqTYqFsR8Y95SN',
    urihash: 'AHMqTYqFsR8Y95SN',
    permanentid: 'd71d8c729793dad92556be8dc05707feaa9d2f75ab630984b2a4d86aad9c',
    foldingchild: ['49135'],
    foldingparent: '152032',
    ...reusableRawFields,
  },
});

const pyrenomycetes = {
  title: 'Pyrenomycetes',
  uri: 'https://www.inaturalist.org/taxa/372740',
  printableUri: 'https://www.inaturalist.org/taxa/372740',
  clickUri: 'https://www.inaturalist.org/taxa/372740',
  uniqueId: '42.29355$https://www.inaturalist.org/taxa/372740',
  excerpt: 'Pyrenomycetes',
  score: 0,
  parentResult: null,
  childResults: [],
  ...reusableFields,
  raw: {
    sysurihash: '8PN6yXXAkzLRJxsL',
    urihash: '8PN6yXXAkzLRJxsL',
    permanentid: '69e177b5643322a07a6d42702068325b9f9c76d516fd3132eadc06ac3672',
    foldingchild: ['372740'],
    foldingparent: '372740',
    ...reusableRawFields,
  },
};

export function makeChildComponents(grandChildren?: HTMLElement): HTMLElement {
  const children = generateComponentHTML('atomic-result-children');
  const childrenTemplate = generateComponentHTML(
    'atomic-result-children-template'
  );
  const link = generateComponentHTML('atomic-result-link');
  const template = generateComponentHTML('template') as HTMLTemplateElement;

  template.content.appendChild(link);
  if (grandChildren) {
    template.content.appendChild(grandChildren);
  }

  childrenTemplate.appendChild(template);
  children.appendChild(childrenTemplate);
  return children;
}
