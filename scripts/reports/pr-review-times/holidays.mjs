// scripts/reports/pr-review-times/holidays.mjs

const FIXED_HOLIDAYS_MM_DD = new Set([
  '01-01', // New Year
  '01-02', // Day after New Year (Generous)
  '06-19', // Juneteenth (US)
  '06-24', // St-Jean (QC)
  '07-01', // Canada Day
  '07-04', // Independence Day (US)
  '09-30', // Truth & Reconciliation (CA - Generous)
  '12-24', // Christmas Eve
  '12-25', // Christmas
  '12-26', // Boxing Day
  '12-31', // New Year's Eve
]);

// Hand-picked irregular moving dates (Easter-related)
// Good Friday (-2 from Easter) and Easter Monday (+1 from Easter)
const IRREGULAR_HOLIDAYS = [
  // 2023 (Easter Apr 9)
  '2023-04-07',
  '2023-04-10',
  // 2024 (Easter Mar 31)
  '2024-03-29',
  '2024-04-01',
  // 2025 (Easter Apr 20)
  '2025-04-18',
  '2025-04-21',
  // 2026 (Easter Apr 5)
  '2026-04-03',
  '2026-04-06',
  // 2027 (Easter Mar 28)
  '2027-03-26',
  '2027-03-29',
];

/**
 * Returns a set of holidays strings (YYYY-MM-DD) for CA and US.
 * Includes fixed dates, calculated rule-based dates, and hardcoded irregular dates.
 * Generous policy: Includes likely bridge days and observed days where obvious.
 */
export function getHolidays() {
  const holidays = new Set(IRREGULAR_HOLIDAYS);
  const startYear = 2022;
  const endYear = 2027;

  for (let year = startYear; year <= endYear; year++) {
    // 1. Add Fixed Dates
    for (const mmdd of FIXED_HOLIDAYS_MM_DD) {
      holidays.add(`${year}-${mmdd}`);
    }

    // 2. Add Rule-Based Dates
    // Family Day / Presidents Day: 3rd Monday of Feb
    holidays.add(getNthWeekdayOfMonth(year, 1, 1, 3)); // Feb (1), Mon (1), 3rd

    // Victoria Day: Monday before May 25
    // Logic: Find May 25. If Mon, use it? No "before" usually means strictly before?
    // Convention: The Monday preceding May 25. (i.e. between 18th and 24th inclusive).
    holidays.add(getVictoriaDay(year));

    // Memorial Day: Last Monday of May
    holidays.add(getLastWeekdayOfMonth(year, 4, 1)); // May (4), Mon (1)

    // Labor Day: 1st Monday of Sept
    holidays.add(getNthWeekdayOfMonth(year, 8, 1, 1)); // Sept (8), Mon (1), 1st

    // Thanksgiving (CA): 2nd Monday of Oct
    holidays.add(getNthWeekdayOfMonth(year, 9, 1, 2)); // Oct (9), Mon (1), 2nd

    // Thanksgiving (US): 4th Thursday of Nov
    const thanksgivingUS = getNthWeekdayOfMonth(year, 10, 4, 4); // Nov (10), Thu (4), 4th
    holidays.add(thanksgivingUS);

    // Day after Thanksgiving (Black Friday - Generous)
    const thxDate = new Date(thanksgivingUS);
    thxDate.setDate(thxDate.getDate() + 1);
    holidays.add(formatDate(thxDate));
  }

  return holidays;
}

/**
 * Helper: Get YYYY-MM-DD for Nth weekday of month
 * @param {number} year
 * @param {number} monthIndex 0=Jan, 11=Dec
 * @param {number} dayOfWeek 0=Sun, 1=Mon, ..., 6=Sat
 * @param {number} n 1=1st, 2=2nd...
 */
function getNthWeekdayOfMonth(year, monthIndex, dayOfWeek, n) {
  const date = new Date(year, monthIndex, 1);
  let count = 0;
  while (date.getMonth() === monthIndex) {
    if (date.getDay() === dayOfWeek) {
      count++;
      if (count === n) {
        return formatDate(date);
      }
    }
    date.setDate(date.getDate() + 1);
  }
  return null;
}

/**
 * Helper: Get YYYY-MM-DD for Last weekday of month
 */
function getLastWeekdayOfMonth(year, monthIndex, dayOfWeek) {
  const date = new Date(year, monthIndex + 1, 0); // Last day of month
  while (date.getMonth() === monthIndex) {
    if (date.getDay() === dayOfWeek) {
      return formatDate(date);
    }
    date.setDate(date.getDate() - 1);
  }
  return null;
}

/**
 * Helper: Victoria Day (Monday before May 25)
 * Dates range from May 18 to May 24.
 */
function getVictoriaDay(year) {
  // Start at May 24 and go backwards until Monday
  const date = new Date(year, 4, 24); // May 24
  while (date.getDay() !== 1) {
    // 1 = Monday
    date.setDate(date.getDate() - 1);
  }
  return formatDate(date);
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isHoliday(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return getHolidays().has(`${yyyy}-${mm}-${dd}`);
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0=Sun, 6=Sat
}

/**
 * Calculates business hours between two dates.
 * Assumes 24h work day? Or just filtering out full days?
 * Requirement: "duration calculation by business days".
 * Usually this means hours, but ignoring weekends/holidays.
 * Implementation:
 * Iterate by hour? Or simply subtract full non-business days * 24h?
 * If the user wants "business days", maybe they want the result in Days, not Hours?
 * Previous metric was "durationHours".
 * Let's keep Hours but exclude weedends/holidays.
 *
 * Simple Algorithm:
 * 1. Calculate total duration in ms.
 * 2. Calculate number of full weekend/holiday days in the interval.
 * 3. Subtract that time.
 *
 * Edge case: Start or End is on a weekend/holiday?
 * If you request a review on Saturday, clock shouldn't start until Monday.
 * If you review on Saturday, does it count?
 *
 * Standard SLA logic:
 * - If start is on non-business time, move start to next business open (e.g. Monday 00:00).
 * - If end is on non-business time, move end to next business open? Or keep as is?
 *   If I review on Saturday, I reviewed it. Time stopped.
 *   If I review on Monday, time runs from Monday 00:00.
 *
 * Let's implementation:
 * - Shift Start to next Business Day 00:00 if on Holiday/Weekend.
 * - Shift End to previous Business Day 23:59:59 ?? No, if done on weekend, it counts as done.
 *   Actually, if done on weekend, duration from Friday 23:59 is 0.
 *
 * Revised Algorithm:
 * - Iterate from Start Date to End Date by Day.
 * - If Day is Weekend/Holiday, it contributes 0 hours.
 * - If Start Day: contribute (24h - startHour) if valid day.
 * - If End Day: contribute (endHour) if valid day.
 * - Middle Days: contribute 24h if valid.
 */
export function calculateBusinessHours(startIso, endIso) {
  if (!startIso || !endIso) return null;

  const start = new Date(startIso);
  const end = new Date(endIso);

  if (start > end) return 0;

  // Normalize Start: If start is on non-business day, move calculated start to next business day 00:00.
  // Why? Because timer shouldn't start ticking.
  while (isWeekend(start) || isHoliday(start)) {
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    // Safety: don't pass end
    if (start > end) return 0;
  }

  // Normalize End: If end is on non-business day...
  // If I review on Sunday, and timer started Friday..
  // Time = Friday remaining. Saturday 0. Sunday? 0?
  // If I review on Sunday, I should probably get credit as if I reviewed on next Monday?
  // Or just stop timer at Friday 23:59?
  // Let's assume non-business days stop the clock completely.
  // So if done on Sunday, it's effectively done "during the weekend", so clock stopped Friday.
  // But what if it started Saturday and ended Sunday? 0 hours. Correct.

  let totalMs = 0;
  const current = new Date(start);

  // We clone to iterate days
  // Special handling for same day
  if (isSameDay(start, end)) {
    if (!isWeekend(start) && !isHoliday(start)) {
      return (end - start) / (1000 * 60 * 60);
    } else {
      return 0;
    }
  }

  // First partial day
  if (!isWeekend(start) && !isHoliday(start)) {
    const endOfDay = new Date(start);
    endOfDay.setHours(23, 59, 59, 999);
    totalMs += endOfDay - start;
  }

  // Move to next day start
  current.setDate(current.getDate() + 1);
  current.setHours(0, 0, 0, 0);

  // Iterate full days until the day of 'end'
  while (!isSameDay(current, end)) {
    if (!isWeekend(current) && !isHoliday(current)) {
      totalMs += 24 * 60 * 60 * 1000;
    }
    current.setDate(current.getDate() + 1);
    // Safety break
    if (current > end) break;
  }

  // Last partial day
  if (!isWeekend(end) && !isHoliday(end)) {
    // From 00:00 to end time
    const startOfDay = new Date(end);
    startOfDay.setHours(0, 0, 0, 0);
    totalMs += end - startOfDay;
  }

  return totalMs / (1000 * 60 * 60);
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
