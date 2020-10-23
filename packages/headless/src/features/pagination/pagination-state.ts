export interface PaginationState {
  firstResult: number;
  numberOfResults: number;
  totalCountFiltered: number;
}

export function getPaginationInitialState(): PaginationState {
  return {
    firstResult: 0,
    numberOfResults: 10,
    totalCountFiltered: 0,
  };
}
