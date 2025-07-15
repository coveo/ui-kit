import type {ThunkExtraArguments} from './thunk-extra-arguments.js';

export interface AsyncThunkOptions<
  T,
  TExtra extends ThunkExtraArguments = ThunkExtraArguments,
> {
  state: T;
  extra: TExtra;
}
