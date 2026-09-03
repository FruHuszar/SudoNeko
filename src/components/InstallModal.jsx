export default function InstallModal({ onClose }) {
  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal install-help" onPointerDown={(event) => event.stopPropagation()}>
        <h2>Add SudoNeko to your home screen</h2>
        <p>Tap the share button in the browser bar, then choose “Add to Home Screen”.</p>
        <p className="welcome-note">It opens full screen and works offline.</p>
        <button type="button" className="pill-button accent" onPointerDown={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
