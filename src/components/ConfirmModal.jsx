export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onPointerDown={onCancel}>
      <div className="modal" onPointerDown={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button type="button" className="pill-button accent" onPointerDown={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="pill-button" onPointerDown={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
