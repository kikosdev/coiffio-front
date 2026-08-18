import './switch.css';

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
  id?: string;
}

/**
 * 3-state switch (OFF / ON / disabled-while-saving) — see switch.css for the exact visual
 * contract. `<button>` gives native keyboard support (Enter/Space) for free.
 */
export function Switch({ checked, onChange, disabled = false, ariaLabel, id }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`ui-switch ${checked ? 'is-on' : 'is-off'}`}
    >
      <span className="ui-switch-knob" />
    </button>
  );
}
