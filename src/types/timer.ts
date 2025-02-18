export interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimerProps {
  time: TimerState;
  isPaused: boolean;
  fontSize: number;
  marginBottom: number;
  onClick: () => void;
}
