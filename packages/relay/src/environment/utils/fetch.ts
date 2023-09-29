export async function fetchAPI(
  url: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, init).catch((err: Error) => {
    throw new Error(
      `${err.message}: The "host" value is invalid or a network error occured, according to the FetchAPI's response.`,
      { cause: err }
    );
  });
}
