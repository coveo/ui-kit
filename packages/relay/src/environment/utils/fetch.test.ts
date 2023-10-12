import { fetchAPI } from "./fetch";

describe("fetchAPI", () => {
  it("returns the response when fetch api request is resolved", async () => {
    globalThis.fetch = jest.fn(() => Promise.resolve({ ok: true } as Response));

    const response = await fetchAPI("boup");

    expect(response).toEqual({ ok: true });
  });

  it("throws the default error message if the promise is rejected", () => {
    globalThis.fetch = jest.fn(() => Promise.reject({ message: "whoops" }));

    expect(fetchAPI("boup")).rejects.toThrow(
      'whoops: The "host" value is invalid or a network error occured, according to the FetchAPI\'s response.'
    );
  });
});
