import {
  SORT_FIELDS,
  SORT_FIELD_LABEL,
  WATCH_STATUSES,
  WATCH_STATUS_LABEL,
  type ListQuery,
  type SortField,
  type WatchStatus,
} from '@marquee/shared';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Select } from '../../components/ui/Select';

export type StatusFilter = WatchStatus | 'all';

type WatchlistToolbarProps = {
  query: ListQuery;
  counts: Record<StatusFilter, number> | null;
  onChange: (next: ListQuery) => void;
};

const SORT_OPTIONS = SORT_FIELDS.map((value) => ({ value, label: SORT_FIELD_LABEL[value] }));

export function WatchlistToolbar({ query, counts, onChange }: WatchlistToolbarProps) {
  const statusOptions = [
    { value: 'all' as const, label: 'All', badge: counts?.all },
    ...WATCH_STATUSES.map((s) => ({ value: s, label: WATCH_STATUS_LABEL[s], badge: counts?.[s] })),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="overflow-x-auto pb-1 -mb-1 sm:overflow-visible">
        <SegmentedControl<StatusFilter>
          label="Filter by status"
          value={query.status ?? 'all'}
          options={statusOptions}
          onChange={(value) => onChange({ ...query, status: value === 'all' ? undefined : value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select<SortField> label="Sort by" value={query.sort} options={SORT_OPTIONS} onChange={(sort) => onChange({ ...query, sort })} />
        <Button
          variant="secondary"
          size="sm"
          className="h-10 w-10 px-0"
          aria-label={query.order === 'desc' ? 'Sorted descending, switch to ascending' : 'Sorted ascending, switch to descending'}
          onClick={() => onChange({ ...query, order: query.order === 'desc' ? 'asc' : 'desc' })}
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-4 transition-transform duration-(--duration-normal)" style={{ transform: query.order === 'asc' ? 'rotate(180deg)' : undefined }} aria-hidden="true">
            <path d="M10 4v12m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
