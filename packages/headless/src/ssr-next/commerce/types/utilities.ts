import type {SolutionType} from './controller-constants.js';

export type HasSolutionType<
  TDefinition,
  TSolutionType extends SolutionType,
> = TDefinition extends {[K in TSolutionType]: true}
  ? true
  : TDefinition extends {[K in TSolutionType]: false}
    ? false
    : false;
