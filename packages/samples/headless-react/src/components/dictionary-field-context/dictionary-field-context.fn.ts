import {buildDictionaryFieldContext} from '@coveo/headless';
import {useContext} from 'react';
import {AppContext} from '../../context/engine';

export function DictionaryFieldContext() {
  const {engine} = useContext(AppContext);
  const ctx = buildDictionaryFieldContext(engine!);

  ctx.set({price: 'usd', city: 'boston'});

  return null;
}
