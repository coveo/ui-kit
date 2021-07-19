import {RelativeDate} from './relative-date';

export type RelativeDateSetState = Record<string, Record<string, RelativeDate>>;

export function getRelativeDateSetInitialState(): RelativeDateSetState {
  return {};
}
