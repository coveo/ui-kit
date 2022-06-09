export interface PaginationState {
  firstResult: number;
  defaultNumberOfResults: number;
  numberOfResults: number;
  totalCountFiltered: number;
}

export function getPaginationInitialState(): PaginationState {
  return {
    firstResult: 0,
    defaultNumberOfResults: 10,
    numberOfResults: 10,
    totalCountFiltered: 0,
  };
}
