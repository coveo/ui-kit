export type SolutionTypeId = string;

export type SlicedBySolutionType<Slice> = Record<SolutionTypeId, Slice>;

export function getSlicedBySolutionTypeInitialState<
  Slice,
>(): SlicedBySolutionType<Slice> {
  return {};
}
