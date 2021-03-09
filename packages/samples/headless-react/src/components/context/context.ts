import {buildContext, HeadlessEngine, searchAppReducers} from '@coveo/headless';

export function setContext(
  engine: HeadlessEngine<typeof searchAppReducers>,
  ageGroup: string,
  interests: string[]
) {
  buildContext(engine!).set({
    ageGroup,
    interests,
  });
}
