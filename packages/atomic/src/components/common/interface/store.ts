export interface CommonStore<StoreData> {
  state: StoreData;
  onChange: <PropName extends keyof StoreData>(
    propName: PropName,
    cb: (newValue: StoreData[PropName]) => void
  ) => () => void;
}

export interface ResultListInfo {
  focusOnNextNewResult(): void;
  focusOnFirstResultAfterNextSearch(): Promise<void>;
}
