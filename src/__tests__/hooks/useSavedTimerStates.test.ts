import { pruneExpiredSavedStates } from '../../hooks/useSavedTimerStates';
import { SavedState, TimerState, AppSettings } from '../../types/timer';

// Base objects for test data
const createBaseAppSettings = (): AppSettings => ({
  darkMode: true, 
  fontSize: 48, 
  embedOverflow: false, 
  wakeLockEnabled: false
});

const createBaseTimerState = (overrides: Partial<TimerState> = {}): TimerState => ({
  totalMs: 60000, // Default 1 minute
  paused: false,
  startTime: Date.now(),
  pauseStart: 0,
  totalPauseMs: 0,
  ...overrides
});

const createSavedState = (overrides: Partial<SavedState> = {}): SavedState => {
  const now = Date.now();
  return {
    id: '1',
    name: 'Test state',
    savedAt: undefined,
    timerState: createBaseTimerState(),
    appSettings: createBaseAppSettings(),
    ...overrides
  };
};

describe('pruneExpiredSavedStates', () => {
  it('should filter out invalid inputs', () => {
    expect(pruneExpiredSavedStates(null as any)).toEqual([]);
    expect(pruneExpiredSavedStates(undefined as any)).toEqual([]);
    expect(pruneExpiredSavedStates({} as any)).toEqual([]);
    expect(pruneExpiredSavedStates('not an array' as any)).toEqual([]);
    const states: any = [
      { id: '1', name: 'Valid', savedAt: Date.now(), timerState: null, appSettings: {} },
      { id: '2', name: 'Valid2', savedAt: Date.now(), appSettings: {} },
    ];
    expect(pruneExpiredSavedStates(states)).toEqual([]);
  });

  it('should keep states with remaining time above -10 minutes', () => {
    const now = Date.now();
    
    const states: SavedState[] = [
      // An active timer with 30 seconds remaining - should keep
      createSavedState({
        id: '1',
        name: 'Recent state',
        timerState: createBaseTimerState({
          startTime: now - 30000 // 30 seconds ago
        })
      }),
      
      // A timer that expired 11+epsilon minutes ago - should prune
      createSavedState({
        id: '2',
        name: 'Expired state',
        timerState: createBaseTimerState({
          startTime: now - 1000 * 60 * 11.001
        })
      }),
      
      // A timer that expired 9.5 minutes ago - should keep (within 10 min limit)
      createSavedState({
        id: '3',
        name: 'Almost expired state',
        timerState: createBaseTimerState({
          startTime: now - 1000 * 60 * 10.99
        })
      })
    ];

    const result = pruneExpiredSavedStates(states);
    
    // We should have 2 states (the first and third)
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });

  it('should handle active timers with time remaining', () => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const twentyMinutesAgo = now - 20 * 60 * 1000;
    
    const states: SavedState[] = [
      // A timer that started 20 minutes ago with 5 minutes duration - should be pruned
      createSavedState({
        id: '1',
        name: 'Expired timer',
        timerState: createBaseTimerState({
          totalMs: 5 * 60 * 1000, // 5 minutes
          startTime: twentyMinutesAgo
        })
      }),
      
      // A timer that started 5 minutes ago with 20 minutes duration - should be kept
      createSavedState({
        id: '2',
        name: 'Active timer',
        timerState: createBaseTimerState({
          totalMs: 20 * 60 * 1000, // 20 minutes
          startTime: fiveMinutesAgo
        })
      })
    ];

    const result = pruneExpiredSavedStates(states);
    
    // Should only keep the second timer
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should handle edge case with exactly -10 minutes remaining', () => {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    
    const states: SavedState[] = [
      createSavedState({
        id: '1',
        name: 'Borderline state',
        timerState: createBaseTimerState({
          startTime: tenMinutesAgo - 60000 // Started 11 minutes ago
        })
      })
    ];
    
    const result = pruneExpiredSavedStates(states);
    
    // Should keep the timer because it's exactly at the threshold
    expect(result).toHaveLength(1);
  });
  
  it('should handle edge case with slightly more than -10 minutes remaining', () => {
    const now = Date.now();
    const tenMinutesAndOneSecondAgo = now - (10 * 60 * 1000 + 1000);
    
    const states: SavedState[] = [
      createSavedState({
        id: '1',
        name: 'Just beyond threshold',
        timerState: createBaseTimerState({
          totalMs: 0, // Immediate expiration
          startTime: tenMinutesAndOneSecondAgo
        })
      })
    ];
    
    const result = pruneExpiredSavedStates(states);
    
    // Should prune the timer because it's just beyond the threshold
    expect(result).toHaveLength(0);
  });

  it('should handle paused timers correctly', () => {
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    const tenMinutesAgo = now - 10 * 60 * 1000;
    
    // A timer that started 15 minutes ago, ran for 5 minutes, then was paused 10 minutes ago
    // Still has 5 minutes remaining on the timer
    const states: SavedState[] = [
      createSavedState({
        id: '1',
        name: 'Paused timer with time left',
        timerState: createBaseTimerState({ 
          totalMs: 10 * 60 * 1000, // 10 minutes total
          paused: true,
          startTime: fifteenMinutesAgo, 
          pauseStart: tenMinutesAgo // Paused 10 minutes ago
        })
      })
    ];
    
    const result = pruneExpiredSavedStates(states);
    
    // Should keep the timer because even though it's old, it's paused with time left
    expect(result).toHaveLength(1);
  });
});
