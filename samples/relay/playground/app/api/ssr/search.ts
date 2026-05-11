export async function search(
  query: string,
  clientId: string,
  userAgent: string,
  locationUrl: string,
  referrer: string,
) {
  const url = process.env["NEXT_PUBLIC_SEARCH_URL"];
  const trackingId = process.env["NEXT_PUBLIC_TRACKING_ID"];

  if (!url) {
    return {
      success: false,
      status: 500,
      message: "Commerce API search URL is not defined.",
    };
  }

  const requestBody = {
    trackingId: trackingId,
    clientId,
    context: {
      view: {
        url: locationUrl,
      },
      capture: true,
      cart: [],
      user: {
        userAgent,
        referrer,
      },
    },
    language: "en",
    country: "US",
    currency: "USD",
    page: 0,
    perPage: 5,
    facets: [],
    sort: { sortCriteria: "relevance" },
    query,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env["NEXT_PUBLIC_TOKEN"]}`,
    "User-Agent": userAgent,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      return {
        success: false,
        status: response.status,
        message: errorMessage || "Failed to fetch data from Coveo",
      };
    }

    return {
      success: true,
      data: await response.json(),
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch data from Coveo",
    };
  }
}
