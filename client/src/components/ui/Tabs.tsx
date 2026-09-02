type Option<V extends string> = { value: V; label: string; count?: number | undefined };

type TabsProps<V extends string> = {
  label: string;
  value: V;
  options: readonly Option<V>[];
  onChange: (value: V) => void;
};

/** Joined mono tabs, the way a strip of roll tickets reads. */
export function Tabs<V extends string>({ label, value, options, onChange }: TabsProps<V>) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" className="tab" aria-selected={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span className="n">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
