export function promiseTimeout<T>(prom: T | Promise<T>, ms = 700) {
  let id: NodeJS.Timeout;
  const timeout = new Promise((_, reject) => {
    id = setTimeout(() => {
      reject(new Error('Promise timed out.'));
    }, ms);
  });
  return Promise.race([prom, timeout]).then(() => {
    clearTimeout(id);
  });
}
