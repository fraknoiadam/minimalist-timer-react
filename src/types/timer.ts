export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimerProps {
  time: TimeRemaining;
  isPaused: boolean;
  fontSize: number;
  marginBottom: number;
  onClick: () => void;
}

export interface TimerState {
  totalMs: number;
  paused: boolean;
  startTime: number | null;
  pauseStart: number;
  totalPauseMs: number;
}
