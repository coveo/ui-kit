import {RelativeDateMap} from './relative-date';

export type RelativeDateSetState = Record<string, RelativeDateMap[]>;

export function getRelativeDateSetInitialState(): RelativeDateSetState {
  return {};
}
