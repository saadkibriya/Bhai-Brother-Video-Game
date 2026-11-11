import { useEffect, useState } from 'react';
import { openStatus } from '../lib/hours';

export function OpenStatus() {
  const [status, setStatus] = useState(() => openStatus());

  useEffect(() => {
    const timer = window.setInterval(() => setStatus(openStatus()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="status" data-open={status.open} title={`${status.label} — ${status.detail}`}>
      <span className="status__dot" aria-hidden="true" />
      {status.label} <span className="status__detail">· {status.detail}</span>
    </span>
  );
}
