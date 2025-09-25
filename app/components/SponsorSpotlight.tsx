"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SponsorSpotlightProps = {
  items?: string[];
  durationMs?: number;
};

const DEFAULT_DURATION = 2200;

export default function SponsorSpotlight({
  items = [],
  durationMs = DEFAULT_DURATION,
}: SponsorSpotlightProps) {
  const sponsorNames = useMemo(
    () => items.filter((item) => item && item.trim().length > 0),
    [items],
  );

  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [lastPick, setLastPick] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset to the beginning when the underlying list changes.
    setIndex(0);
    setLastPick(null);
  }, [sponsorNames]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const spin = useCallback(() => {
    if (spinning || sponsorNames.length === 0) {
      return;
    }

    setSpinning(true);

    const start = performance.now();
    const resultIndex = Math.floor(Math.random() * sponsorNames.length);
    const fullLoops = 6 + Math.floor(Math.random() * 3); // 6-8 loops for drama
    const totalSteps =
      fullLoops * sponsorNames.length +
      ((resultIndex - index + sponsorNames.length) % sponsorNames.length);

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      const step = Math.floor(eased * totalSteps);
      const currentIndex = (index + step) % sponsorNames.length;
      setIndex(currentIndex);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        setLastPick(sponsorNames[resultIndex]);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [durationMs, index, sponsorNames, spinning]);

  if (sponsorNames.length === 0) {
    return null;
  }

  const prev = sponsorNames[(index - 1 + sponsorNames.length) % sponsorNames.length];
  const current = sponsorNames[index % sponsorNames.length];
  const next = sponsorNames[(index + 1) % sponsorNames.length];

  return (
    <section className="sponsor-spotlight">
      <div className="sponsor-spotlight__body">
        <header className="sponsor-spotlight__header">
          <span className="sponsor-spotlight__eyebrow">Sponsor Spotlight</span>
          <h2 className="sponsor-spotlight__title">Celebrate a Partner</h2>
          <p className="sponsor-spotlight__description">
            Spin the wheel to highlight one of the generous sponsors powering SoNo Fest.
          </p>
        </header>

        <div className="sponsor-spotlight__machine" aria-live="polite" aria-atomic>
          <div className="sponsor-spotlight__row" aria-hidden="true">
            {prev}
          </div>
          <div className="sponsor-spotlight__row sponsor-spotlight__row--active">{current}</div>
          <div className="sponsor-spotlight__row" aria-hidden="true">
            {next}
          </div>
          <div className="sponsor-spotlight__divider" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="btn sponsor-spotlight__button"
          onClick={spin}
          disabled={spinning}
        >
          {spinning ? "Spinning…" : "Pick a Sponsor"}
        </button>

        {lastPick ? (
          <p className="sponsor-spotlight__result">
            <span>Spotlight on</span>
            <strong>{lastPick}</strong>
          </p>
        ) : null}
      </div>
    </section>
  );
}

