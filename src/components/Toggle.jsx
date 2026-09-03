export default function Toggle({ label, hint, checked, disabled, onChange }) {
  return (
    <button
      type="button"
      className={`toggle-row${disabled ? ' disabled' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onPointerDown={() => !disabled && onChange(!checked)}
    >
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        {hint && <span className="toggle-hint">{hint}</span>}
      </span>
      <span className={`toggle-track${checked ? ' on' : ''}`}>
        <span className="toggle-knob" />
      </span>
    </button>
  );
}
