import { X } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Appointment } from './bookingStore';

const SOURCE_LABEL: Record<Appointment['source'], string> = {
  online: 'En ligne',
  walkin: 'Walk-in',
  phone: 'Tél.',
};

interface AppointmentCardProps {
  appt: Appointment;
  color: string; // couleur du service (bloc fusionné si chaîné — un seul Appointment)
  serviceLabel: string;
  clientLabel: string;
  style?: CSSProperties; // positionnement dans la grille
  onCancel?: (id: string) => void;
}

function fmt(iso: string): string {
  return new Date(iso).toISOString().slice(11, 16);
}

/** Bloc RDV coloré (couleur du service). Services chaînés = un seul bloc contigu (#3). */
export function AppointmentCard({ appt, color, serviceLabel, clientLabel, style, onCancel }: AppointmentCardProps) {
  const cancelled = appt.status === 'cancelled';
  return (
    <div
      className={`group absolute left-1 right-1 overflow-hidden rounded-lg border px-2 py-1 text-xs shadow-soft ${
        cancelled ? 'opacity-40 line-through' : ''
      }`}
      style={{ borderLeft: `3px solid ${color}`, backgroundColor: `${color}1A`, ...style }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="tabnums font-medium text-ink">
          {fmt(appt.start)}–{fmt(appt.end)}
        </span>
        {onCancel && !cancelled && (
          <button
            onClick={() => onCancel(appt._id)}
            className="text-muted opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
            aria-label="Annuler"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <p className="truncate text-ink">{clientLabel}</p>
      <p className="truncate text-muted">
        {serviceLabel} · {SOURCE_LABEL[appt.source]}
      </p>
    </div>
  );
}
