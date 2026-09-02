import { SORT_FIELDS, SORT_FIELD_LABEL, WATCH_STATUSES, WATCH_STATUS_LABEL, type ListQuery, type SortField, type WatchStatus } from '@marquee/shared';
import { Tabs } from '../../components/ui/Tabs';

export type StatusFilter = WatchStatus | 'all';

type RailProps = {
  query: ListQuery;
  counts: Record<StatusFilter, number> | null;
  onChange: (next: ListQuery) => void;
};

/** Filter tabs and sort controls for the roll. State lives in the URL (see WatchlistPage). */
export function Rail({ query, counts, onChange }: RailProps) {
  const options = [
    { value: 'all' as const, label: 'All', count: counts?.all },
    ...WATCH_STATUSES.map((s) => ({ value: s, label: WATCH_STATUS_LABEL[s], count: counts?.[s] })),
  ];
  const sortId = 'sort-by';

  return (
    <div className="rail">
      <Tabs<StatusFilter>
        label="Filter by status"
        value={query.status ?? 'all'}
        options={options}
        onChange={(value) => onChange({ ...query, status: value === 'all' ? undefined : value })}
      />
      <div className="sort">
        <label className="sort__label" htmlFor={sortId}>
          Sort
        </label>
        <select id={sortId} className="select" value={query.sort} onChange={(e) => onChange({ ...query, sort: e.target.value as SortField })}>
          {SORT_FIELDS.map((f) => (
            <option key={f} value={f}>
              {SORT_FIELD_LABEL[f]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="dirbtn"
          aria-label={query.order === 'desc' ? 'Sorted descending. Switch to ascending' : 'Sorted ascending. Switch to descending'}
          onClick={() => onChange({ ...query, order: query.order === 'desc' ? 'asc' : 'desc' })}
        >
          {query.order === 'desc' ? 'Newest ↓' : 'Oldest ↑'}
        </button>
      </div>
    </div>
  );
}
