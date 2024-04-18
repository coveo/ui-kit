type SliceId = string;
export type Sliced<Slice> = Record<SliceId, Slice>;

export type CommerceSlicesState = Sliced<unknown>;

export function getSliced<
  Slice,
>(): Sliced<Slice> {
  return {};
}
