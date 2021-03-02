import {buildContext} from '@coveo/headless';
import {engine} from '../../engine';

export function setContext(ageGroup: string, interests: string[]) {
  buildContext(engine).set({
    ageGroup,
    interests,
  });
}
