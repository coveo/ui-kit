import {TSDocParser} from '@microsoft/tsdoc';
import {ApiFunction} from '@microsoft/api-extractor-model';

export function buildMockApiDocComment(comment: string) {
  const parser = new TSDocParser();
  return (parser.parseString(comment)
    .docComment as unknown) as ApiFunction['tsdocComment'];
}
