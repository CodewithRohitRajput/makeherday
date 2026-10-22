import { createContext, useContext, type RefObject } from "react";

/** Seconds after the tap at which each beat of the reveal happens. */
export const BEATS = {
  sealPop: 0,
  flapOpen: 0.3,
  envelopeAway: 1.4,
  roseRise: 1.5,
  bloom: 2.6,
  bloomLength: 4.4,
  words: 5.6,
  wordGap: 0.9,
  /** Pause after the last phrase appears before the finale. */
  finaleDelay: 2.5,
} as const;

export function finaleAt(phrases: number) {
  return BEATS.words + phrases * BEATS.wordGap + BEATS.finaleDelay;
}

/**
 * Shared clock for the scene: a ref holding the canvas clock time of the tap,
 * or null while the envelope is still sealed. Everything animates as a pure
 * function of the time since then, so replaying is just resetting the ref.
 */
export type Timeline = RefObject<number | null>;

export const TimelineContext = createContext<Timeline>({ current: null });

export function useTimeline() {
  return useContext(TimelineContext);
}

export function elapsed(timeline: Timeline, now: number) {
  return timeline.current === null ? -1 : now - timeline.current;
}
