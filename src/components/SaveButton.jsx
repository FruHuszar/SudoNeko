import GoogleMark from './GoogleMark';

export default function SaveButton({ saving, notice, onSave }) {
  return (
    <div className="save-block">
      <button type="button" className={`pill-button save${saving ? ' busy' : ''}`} onPointerDown={onSave}>
        <GoogleMark />
        Save progress
      </button>
      {notice && <p className="notice">{notice}</p>}
    </div>
  );
}
