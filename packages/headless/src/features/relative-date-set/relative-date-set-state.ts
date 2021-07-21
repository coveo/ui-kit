import {RelativeDate} from './relative-date';

export interface RelativeDateMap extends RelativeDate {
  value: string;
}
export type RelativeDateSetState = Record<string, RelativeDateMap[]>;

export function getRelativeDateSetInitialState(): RelativeDateSetState {
  return {};
}
