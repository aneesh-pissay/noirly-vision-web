/** Today's date as YYYY-MM-DD for native date input `min` (local timezone). */
export function getMinFutureDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isTodayOrFutureDateString(value: string): boolean {
  return value >= getMinFutureDateInputValue();
}
