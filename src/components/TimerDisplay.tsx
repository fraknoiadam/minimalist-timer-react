import { TimerProps } from '../types/timer';

const formatTimeUnit = (unit: number) => unit.toString().padStart(2, '0');

export const TimerDisplay = ({ time, isPaused, fontSize, marginBottom, onClick }: TimerProps) => {
  return (
    <div
      className={`text-center py-8 cursor-pointer ${isPaused ? 'opacity-50' : ''}`}
      style={{
        marginBottom: `${marginBottom}px`,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontWeight: 'bold'
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: `${fontSize}rem` }}>
        {`${time.hours}:${formatTimeUnit(time.minutes)}:${formatTimeUnit(time.seconds)}`}
      </div>
    </div>
  );
};
