import {buildContext, Engine} from '@coveo/headless';

export function setContext(
  engine: Engine,
  ageGroup: string,
  interests: string[]
) {
  buildContext(engine!).set({
    ageGroup,
    interests,
  });
}
