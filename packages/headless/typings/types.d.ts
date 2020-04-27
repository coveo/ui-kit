declare module '@coveo/headless' {
  export type RootState = ReturnType<
    typeof import('../src/app/rootReducer').rootReducer
  >;
}
