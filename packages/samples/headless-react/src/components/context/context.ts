import {buildContext, SearchEngine} from '@coveo/headless';

export function setContext(
  engine: SearchEngine,
  ageGroup: string,
  interests: string[]
) {
  buildContext(engine!).set({
    ageGroup,
    interests,
  });
}
