import SaveButton from './SaveButton';

export default function WelcomeModal({ saving, notice, onSave, onChoose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal welcome">
        <h2>Welcome to SudoNeko!</h2>
        <p>
          One cat per row, per column and per colour patch. Cats never sit side by side or corner to corner.
        </p>
        <p className="welcome-question">Do you want auto markings for faster gameplay?</p>
        <div className="choice-row">
          <button type="button" className="word-choice" onPointerDown={() => onChoose(true)}>
            yes
          </button>
          <button type="button" className="word-choice" onPointerDown={() => onChoose(false)}>
            no
          </button>
        </div>
        <p className="welcome-note">You can change this any time in settings.</p>
        <SaveButton saving={saving} notice={notice} onSave={onSave} />
      </div>
    </div>
  );
}
