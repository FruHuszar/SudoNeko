import Toggle from './Toggle';
import SaveButton from './SaveButton';

export default function SettingsModal({ settings, saving, notice, onChange, onSave, onClose }) {
  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal settings" onPointerDown={(event) => event.stopPropagation()}>
        <h2>Settings</h2>
        <Toggle
          label="Auto markings"
          hint="Place a cat and its row, column, patch and neighbours get crossed off"
          checked={settings.autoMark}
          onChange={(value) => onChange({ ...settings, autoMark: value })}
        />
        <Toggle
          label="Sound"
          hint="Soft taps for marks, a little chirp for cats"
          checked={settings.sound}
          onChange={(value) => onChange({ ...settings, sound: value })}
        />
        <SaveButton saving={saving} notice={notice} onSave={onSave} />
        <button type="button" className="pill-button accent" onPointerDown={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
