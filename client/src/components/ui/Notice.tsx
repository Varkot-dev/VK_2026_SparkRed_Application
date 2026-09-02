import type { ReactNode } from 'react';

type NoticeProps = {
  roll: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

/** Empty and error states print as a small dashed slip, never a sad illustration. */
export function Notice({ roll, title, children, action }: NoticeProps) {
  return (
    <div className="notice">
      <p className="notice__roll">{roll}</p>
      <h2 className="notice__h">{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
