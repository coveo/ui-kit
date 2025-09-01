import {buildContext} from '@coveo/headless';
import {useContext} from 'react';
import {AppContext} from '../../context/engine';

export function Context() {
  const {engine} = useContext(AppContext);
  const ctx = buildContext(engine!);

  ctx.set({ageGroup: '30-45', interests: ['sports', 'camping', 'electronics']});

  return null;
}
