// Paystack NGN settlements land on the NEXT BUSINESS DAY (Mon–Fri,
// excluding public holidays) — never instantly. This is a banking-rail
// constraint, not something our code can speed up: the money moves in
// Paystack's batch settlement run, then NIBSS to the seller's bank.
// First-ever settlements can take an extra cycle (risk review).

// Nigerian public holidays shift settlement by a day. Only fixed-date ones
// are listed; movable ones (Easter, Eid) should be added each year.
const FIXED_HOLIDAYS = [
  "01-01", // New Year's Day
  "05-01", // Workers' Day
  "06-12", // Democracy Day
  "10-01", // Independence Day
  "12-25", // Christmas Day
  "12-26", // Boxing Day
];

function isHoliday(d: Date): boolean {
  const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return FIXED_HOLIDAYS.includes(key);
}

function isBusinessDay(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6 && !isHoliday(d);
}

// Next business day AFTER the given date (settlement never lands same-day).
export function nextSettlementDate(from: Date = new Date()): Date {
  const d = new Date(from);
  do {
    d.setDate(d.getDate() + 1);
  } while (!isBusinessDay(d));
  return d;
}

export function formatSettlementDate(d: Date): string {
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
