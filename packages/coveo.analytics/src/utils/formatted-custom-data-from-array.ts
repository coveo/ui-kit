function filterRepeatedValues(rawData: string[]) {
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
    const analyticsLengthLimit = 256;

    const formattedData = data.join(';');
    if ( formattedData.length <= analyticsLengthLimit) {
        return formattedData;
    }
    return getDataString(data.slice(1));
}

export const formattedCustomDataFromArray = (rawData: string[]) => {
    const dataWithoutRepeatedValues = filterRepeatedValues(rawData);
    const dataWithoutSemicolons = removeSemicolons(dataWithoutRepeatedValues);

    return getDataString(dataWithoutSemicolons);
}