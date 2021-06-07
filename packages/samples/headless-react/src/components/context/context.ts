import {buildContext, Engine} from '@coveo/headless';

export function setContext(
  engine: Engine<object>,
  ageGroup: string,
  interests: string[]
) {
  buildContext(engine!).set({
    ageGroup,
    interests,
  });
}
