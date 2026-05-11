function filterConsecutiveRepeatedValues(rawData: string[]) {
    let prev = '';
    return rawData.filter((value) => {
        const isDifferent = value !== prev;
        prev = value;
        return isDifferent;
    });
}

function removeSemicolons(rawData: string[]) {
    return rawData.map((value) => {
        return value.replace(/;/g, '');
    });
}

function getDataString(data: string[]): string {
    const ANALYTICS_LENGTH_LIMIT = 256;

    const formattedData = data.join(';');
    if (formattedData.length <= ANALYTICS_LENGTH_LIMIT) {
        return formattedData;
    }
    return getDataString(data.slice(1));
}

export const formatArrayForCoveoCustomData = (rawData: string[]): string => {
    const dataWithoutSemicolons = removeSemicolons(rawData);
    const dataWithoutRepeatedValues = filterConsecutiveRepeatedValues(dataWithoutSemicolons);

    return getDataString(dataWithoutRepeatedValues);
};
