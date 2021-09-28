import {ThunkExtraArguments} from './thunk-extra-arguments';

export interface AsyncThunkOptions<
  T,
  TExtra extends ThunkExtraArguments = ThunkExtraArguments
> {
  state: T;
  extra: TExtra;
}
