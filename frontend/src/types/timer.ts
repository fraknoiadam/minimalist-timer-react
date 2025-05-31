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

export interface EmbedSettings {
  links: string[];
  linkSwitchDurationSec: number;
  embedFadeOutSec: number;
}

export interface AppSettings {
  darkMode: boolean;
  fontSize: number;
  embedOverflow: boolean;
  wakeLockEnabled: boolean;
  embedSettings?: EmbedSettings;
}

export interface SavedState {
  id: string;
  name: string;
  savedAt: number;
  timerState: TimerState;
  appSettings: AppSettings;
}
