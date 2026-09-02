/** Shown only while the very first auth check runs, before the router can render a route. */
export function AppBoot() {
  return (
    <div className="lobby" aria-busy="true" aria-live="polite">
      <p className="mono" style={{ color: 'var(--thermal)' }}>
        Box office opening…
      </p>
    </div>
  );
}
