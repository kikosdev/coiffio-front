import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotifStore } from '@/shared/store/notifStore';
import { useAppointmentDetailStore } from '@/shared/store/appointmentDetailStore';
import { INTL_LOCALE, toAppLocale } from '@/config/locale.config';

/** Mappe le type pointé ('appointment.created') vers la clé camelCase de notifications.types — un point dans la clé serait lu comme un séparateur de nesting par i18next. */
const TYPE_KEY: Record<string, string> = {
  'appointment.created': 'appointmentCreated',
  'appointment.cancelled': 'appointmentCancelled',
  'order.created': 'orderCreated',
  'stock.low': 'stockLow',
  'leave.requested': 'leaveRequested',
};


function notifDescription(type: string, payload: Record<string, unknown>): string | null {
  switch (type) {
    case 'order.created':
      return payload.total != null ? `Total : ${payload.total} TND` : null;
    case 'stock.low':
      return payload.name != null ? `${payload.name} — ${payload.stock} restant(s)` : null;
    case 'leave.requested':
      return payload.staffName != null ? String(payload.staffName) : null;
    case 'appointment.created':
    case 'appointment.cancelled':
      return payload.clientName != null ? String(payload.clientName) : null;
    default:
      return null;
  }
}

/** Cloche + dropdown + marquage lu. Les events arrivent en temps réel via le notifStore. */
export function BellMenu() {
  const { t, i18n } = useTranslation('common');
  const intlLocale = INTL_LOCALE[toAppLocale(i18n.language)];
  const items = useNotifStore((s) => s.items);
  const unread = useNotifStore((s) => s.unread());
  const markRead = useNotifStore((s) => s.markRead);
  const readAll = useNotifStore((s) => s.readAll);
  const openAppointment = useAppointmentDetailStore((s) => s.open);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectItem = (n: { _id: string; type: string; payload: Record<string, unknown>; read: boolean }) => {
    if (!n.read) markRead(n._id);
    setOpen(false);
    switch (n.type) {
      case 'appointment.created':
      case 'appointment.cancelled':
        if (typeof n.payload.appointmentId === 'string') openAppointment(n.payload.appointmentId);
        break;
      case 'order.created':
        navigate('/orders');
        break;
      case 'stock.low':
        navigate('/boutique');
        break;
      case 'leave.requested':
        navigate('/team');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl border border-line bg-surface p-2 text-ink transition-colors hover:bg-line/60"
        aria-label={t('notifications.title')}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-80 rounded-card border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-serif text-lg text-ink">{t('notifications.title')}</span>
            {unread > 0 && (
              <button onClick={readAll} className="text-xs text-champagne-deep hover:underline">{t('notifications.markAllRead')}</button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">{t('notifications.empty')}</li>
            ) : (
              items.map((n) => {
                const desc = notifDescription(n.type, n.payload);
                return (
                  <li
                    key={n._id}
                    onClick={() => selectItem(n)}
                    className={`cursor-pointer border-b border-line px-4 py-3 text-sm last:border-0 transition-colors hover:bg-champagne/10 ${n.read ? 'opacity-60' : 'bg-champagne/5'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-ink">{t(`notifications.types.${TYPE_KEY[n.type] ?? n.type}`, { defaultValue: n.type })}</span>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-champagne" />}
                    </div>
                    {desc && <p className="mt-0.5 truncate text-xs text-champagne-deep">{desc}</p>}
                    <span className="text-xs text-muted">{new Date(n.date).toLocaleString(intlLocale)}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
