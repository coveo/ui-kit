import type {StandaloneSearchBoxAnalytics} from '@coveo/headless';

export enum StorageItems {
  RECENT_QUERIES = 'coveo-recent-queries',
  STANDALONE_SEARCH_BOX_DATA = 'coveo-standalone-search-box-data',
  GENERATED_ANSWER_DATA = 'coveo-generated-answer-data',
}

export interface StandaloneSearchBoxData {
  value: string;
  enableQuerySyntax?: boolean;
  analytics: StandaloneSearchBoxAnalytics;
}

export interface GeneratedAnswerData {
  isVisible: boolean;
}

export class SafeStorage implements Storage {
  public clear() {
    return this.tryAccessLocalStorageOrWarn(
      () => localStorage.clear(),
      () => {}
    );
  }

  public getItem(key: StorageItems) {
    return this.tryAccessLocalStorageOrWarn(
      () => localStorage.getItem(key),
      () => null
    );
  }

  public getParsedJSON<T>(key: StorageItems, fallback: T) {
    const item = this.getItem(key);
    if (!item) {
      return fallback;
    }
    return this.tryJSONOrWarn(
      key,
      () => JSON.parse(item) as T,
      () => fallback
    );
  }

  public key(index: number) {
    return this.tryAccessLocalStorageOrWarn(
      () => localStorage.key(index),
      () => null
    );
  }

  public get length() {
    return this.tryOrElse(
      () => localStorage.length,
      () => 0
    );
  }

  public removeItem(key: StorageItems) {
    return this.tryAccessLocalStorageOrWarn(
      () => localStorage.removeItem(key),
      () => {}
    );
  }

  public setItem(key: StorageItems, value: string) {
    return this.tryAccessLocalStorageOrWarn(
      () => localStorage.setItem(key, value),
      () => {}
    );
  }

  public setJSON(key: StorageItems, obj: unknown) {
    const stringified = this.tryJSONOrWarn(
      key,
      () => JSON.stringify(obj),
      () => JSON.stringify({})
    );
    return this.setItem(key, stringified);
  }

  private tryAccessLocalStorageOrWarn<OnSuccess, OnFailure>(
    tryTo: () => OnSuccess,
    orElse: () => OnFailure
  ) {
    return this.tryOrElse(tryTo, () => {
      console.warn(
        'Error while trying to read or modify local storage. This can be caused by browser specific settings.'
      );
      return orElse();
    });
  }

  private tryJSONOrWarn<OnSuccess, OnFailure>(
    key: StorageItems,
    tryTo: () => OnSuccess,
    orElse: () => OnFailure
  ) {
    return this.tryOrElse(tryTo, () => {
      console.warn(
        `Error while trying to do JSON manipulation with local storage entry. ${key}`
      );
      return orElse();
    });
  }

  private tryOrElse<OnSuccess, OnFailure>(
    tryTo: () => OnSuccess,
    orElse: () => OnFailure
  ) {
    try {
      return tryTo();
    } catch (e) {
      console.warn(e as Error);
      return orElse();
    }
  }
}
