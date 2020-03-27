const UPDATE_EXPRESSION = 'query/UDPATE_EXPRESSION';
export const updateQueryExpression = (expression: string) => ({
  type: UPDATE_EXPRESSION,
  payload: {expression},
});

export type QueryActionTypes = ReturnType<typeof updateQueryExpression>;

export interface QueryState {
  expression: string;
}

const queryInitialState: QueryState = {
  expression: '',
};

export function querySlice(
  state = queryInitialState,
  action: QueryActionTypes
): QueryState {
  switch (action.type) {
    case UPDATE_EXPRESSION:
      return {...state, expression: action.payload.expression};
    default:
      return state;
  }
}
