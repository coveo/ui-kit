export const getFormattedLocation = (location: Location) =>
    `${location.protocol}//${location.hostname}${
        location.pathname.indexOf('/') === 0 ? location.pathname : `/${location.pathname}`
    }${location.search}`;
