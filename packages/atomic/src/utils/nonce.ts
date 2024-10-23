interface NonceSingleton {
  value: string | null;
}

const nonceSingleton: NonceSingleton = {
  value: null,
};

export function getNonce() {
  return nonceSingleton.value;
}

export function setNonce(value: string) {
  return (nonceSingleton.value = value);
}
