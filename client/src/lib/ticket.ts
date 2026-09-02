/**
 * Every stub carries printed data that is derived, not stored:
 * the TMDB id becomes the serial, and a row/seat is dealt from the list row id
 * so two stubs never share a seat. Purely presentational.
 */
const ROWS = 'ABCDEFGHJKLMNPRSTUVWXYZ'; // no I or O — real seat maps skip them
const SEATS_PER_ROW = 24;

export function serialFor(tmdbId: number): string {
  return String(tmdbId).padStart(6, '0');
}

export function seatFor(rowId: number): string {
  const safe = Math.abs(rowId);
  const row = ROWS[safe % ROWS.length] ?? 'A';
  const seat = (safe % SEATS_PER_ROW) + 1;
  return `${row}-${String(seat).padStart(2, '0')}`;
}

const DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' });

export function printedDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : DAY_MONTH.format(d).toUpperCase();
}
