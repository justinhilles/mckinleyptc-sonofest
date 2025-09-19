'use client';

import { useEffect, useState } from 'react';

type CountdownProps = {
  eventDate: string;
};

export default function Countdown({ eventDate }: CountdownProps) {
  const [message, setMessage] = useState(() => buildMessage(eventDate));

  useEffect(() => {
    const tick = () => setMessage(buildMessage(eventDate));
    tick();
    const timer = window.setInterval(tick, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [eventDate]);

  return (
    <section className="countdown-section" aria-live="polite">
      <div className="countdown-banner">
        <p id="countdown-text">{message}</p>
      </div>
    </section>
  );
}

function buildMessage(eventDate: string) {
  const now = new Date();
  const target = new Date(eventDate);
  const ms = target.getTime() - now.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));

  if (Number.isNaN(days)) {
    return 'COUNTDOWN UNAVAILABLE';
  }

  if (days > 1) {
    return `${days} DAYS UNTIL KICKOFF`;
  }

  if (days === 1) {
    return 'TOMORROW! SEE YOU AT SoNo!';
  }

  if (days === 0) {
    return 'THIS SUNDAY!';
  }

  return 'THANK YOU FOR CELEBRATING WITH US!';
}
