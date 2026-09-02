/** Placeholder stub shown while the roll prints. */
export function StubSkeleton() {
  return (
    <li className="stub stub--skeleton" aria-hidden="true">
      <span className="stub__notch" />
      <div className="stub__tear" />
      <div className="stub__body">
        <div className="poster" />
        <div className="stub__print">
          <div className="bar" style={{ width: '70%' }} />
          <div className="bar" style={{ width: '45%' }} />
          <div />
          <div className="bar" style={{ height: '2.25rem' }} />
        </div>
      </div>
    </li>
  );
}
