type DateRangeCurrentValues = {
  start: string;
  end: string;
  endInclusive: boolean;
  state: string;
};

export function addSecondsToFacetsTimestamps(
  facetsCurrentValues: DateRangeCurrentValues[],
  seconds: number
): DateRangeCurrentValues[] {
  const pad = (n: number) => String(n).padStart(2, '0');

  const shift = (dateStr: string): string => {
    const normalized = dateStr.replace('@', ' ');
    const date = new Date(normalized);
    date.setSeconds(date.getSeconds() + seconds);

    return (
      `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}` +
      `@${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
  };

  return facetsCurrentValues.map(({start, end, ...rest}) => ({
    start: shift(start),
    end: shift(end),
    ...rest,
  }));
}
