import CatIcon from './CatIcon';
import { formatTime } from './Header';

export default function WinModal({ level, seconds, best, skinId, custom, unlocked, onNext, onReplay }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <CatIcon skinId={skinId} custom={custom} className="modal-cat" />
        <h2>Every cat has a spot</h2>
        <p>Level {level} solved with no paws touching.</p>
        <div className="stat-row">
          <div className="stat">
            <strong>{formatTime(seconds)}</strong>
            <span>this run</span>
          </div>
          <div className="stat">
            <strong>{formatTime(best)}</strong>
            <span>your best</span>
          </div>
        </div>
        {unlocked.length > 0 && <p className="unlocked">New cat waiting for you: {unlocked.join(' and ')}</p>}
        <button type="button" className="pill-button accent" onPointerDown={onNext}>
          Play level {level + 1}
        </button>
        <button type="button" className="pill-button" onPointerDown={onReplay}>
          Solve this one again
        </button>
      </div>
    </div>
  );
}
