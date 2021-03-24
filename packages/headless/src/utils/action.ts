import {AsyncThunk} from '@reduxjs/toolkit';

export type AsyncThunkDefinition<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BaseActionType extends string,
  ReturnType,
  ArgumentType,
  Context
> = AsyncThunk<ReturnType, ArgumentType, Context> & {
  typePrefix: BaseActionType | string;
};
