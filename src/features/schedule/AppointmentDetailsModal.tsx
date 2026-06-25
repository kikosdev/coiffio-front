import { useEffect, useState } from 'react';
import { Banknote, Calendar, Clock, Mail, Phone, Scissors, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useAppointmentDetailStore } from '@/shared/store/appointmentDetailStore';
import { useBookingStore, type Appointment, type AppointmentStatus } from './bookingStore';
import { useServiceStore } from '@/features/services/serviceStore';
import { useClientStore } from '@/features/clients/clientStore';
import { useTeamStore } from '@/features/team/teamStore';
import { useFinanceStore } from '@/features/finance/financeStore';
import { useAuthStore } from '@/shared/store/authStore';
import { useMoneyFormatter } from '@/utils/money';
import { INTL_LOCALE, toAppLocale } from '@/config/locale.config';

const CAN_PAY_ROLES = new Set(['owner', 'manager', 'stylist']);

const STATUS_TONE: Record<AppointmentStatus, 'success' | 'pending' | 'error' | 'neutral'> = {
  booked: 'pending',
  confirmed: 'success',
  completed: 'success',
  cancelled: 'error',
  noshow: 'error',
};

// Les horodatages RDV sont des heures littérales en UTC (cf. availability.util.ts) — on lit
// toujours via les getters UTC, jamais via les getters locaux, pour rester cohérent avec ScheduleScreen.
function fmtDate(iso: string, locale: string): string {
  const d = new Date(iso);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(d);
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' }).format(d);
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(d);
  return `${weekday} ${day} ${month}`;
}
function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

/** Modal global de détails RDV — ouvert depuis le planning (click sur un bloc) ou la cloche notifs. */
export function AppointmentDetailsModal() {
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  const intlLocale = INTL_LOCALE[toAppLocale(i18n.language)];
  const formatMoney = useMoneyFormatter();
  const openId = useAppointmentDetailStore((s) => s.openId);
  const close = useAppointmentDetailStore((s) => s.close);

  const fetchOne = useBookingStore((s) => s.fetchOne);
  const cancel = useBookingStore((s) => s.cancel);
  const pay = useFinanceStore((s) => s.pay);
  const role = useAuthStore((s) => s.user?.role);

  const services = useServiceStore((s) => s.items);
  const fetchServices = useServiceStore((s) => s.fetch);
  const clients = useClientStore((s) => s.items);
  const fetchClients = useClientStore((s) => s.fetch);
  const staff = useTeamStore((s) => s.staff);
  const fetchStaff = useTeamStore((s) => s.fetchStaff);

  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!openId) {
      setAppt(null);
      setError(null);
      return;
    }
    if (services.length === 0) void fetchServices();
    if (staff.length === 0) void fetchStaff();
    void fetchClients();

    setLoading(true);
    setError(null);
    fetchOne(openId)
      .then(setAppt)
      .catch((err) => setError(err instanceof ApiError ? err.message : t('apptModal.notFound')))
      .finally(() => setLoading(false));
    // Ne dépend que de l'ouverture : les stores de lookup gèrent leur propre fetch ci-dessus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const client = appt ? clients.find((c) => c._id === appt.clientId) : undefined;
  const stylist = appt ? staff.find((s) => s.id === appt.stylistId) : undefined;
  const apptServices = appt ? services.filter((s) => appt.services.includes(s._id)) : [];
  const totalDur = apptServices.reduce((a, s) => a + s.durationMin, 0);

  const handleCancel = async () => {
    if (!appt) return;
    setCancelling(true);
    setError(null);
    try {
      await cancel(appt._id);
      const fresh = await fetchOne(appt._id);
      setAppt(fresh);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('apptModal.cancelError'));
    } finally {
      setCancelling(false);
    }
  };

  const handlePayCash = async () => {
    if (!appt || apptServices.length === 0) return;
    setPaying(true);
    setError(null);
    try {
      await pay({
        appointmentId: appt._id,
        stylistId: appt.stylistId,
        method: 'cash',
        items: apptServices.map((s) => ({ kind: 'service', refId: s._id, name: s.name, qty: 1, unitPrice: s.price })),
      });
      const fresh = await fetchOne(appt._id);
      setAppt(fresh);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('apptModal.payError'));
    } finally {
      setPaying(false);
    }
  };

  const canPay = !!role && CAN_PAY_ROLES.has(role);

  return (
    <Modal
      open={!!openId}
      onClose={close}
      title={t('apptModal.title')}
      footer={
        appt && appt.status !== 'cancelled' && appt.status !== 'completed' ? (
          <>
            <Button variant="ghost" onClick={close}>
              {t('common:actions.close')}
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling}>
              {t('apptModal.cancelAppointment')}
            </Button>
            {canPay && (
              <Button variant="primary" leftIcon={<Banknote size={16} />} onClick={handlePayCash} loading={paying}>
                {t('apptModal.payCash')}
              </Button>
            )}
          </>
        ) : (
          <Button variant="ghost" onClick={close}>
            {t('common:actions.close')}
          </Button>
        )
      }
    >
      {loading ? (
        <p className="text-sm text-muted">{t('common:loading')}</p>
      ) : error ? (
        <p className="text-sm text-error">{error}</p>
      ) : appt ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Badge tone={STATUS_TONE[appt.status]} dot>
              {t(`apptModal.status.${appt.status}`)}
            </Badge>
            <Badge tone="neutral">{t(`apptModal.source.${appt.source}`)}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-ink">
            <Calendar size={14} className="text-muted" />
            {fmtDate(appt.start, intlLocale)}
            <Clock size={14} className="ms-2 text-muted" />
            <span className="tabnums">
              {fmtTime(appt.start)}–{fmtTime(appt.end)}
            </span>
          </div>

          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t('apptModal.client')}</p>
            <div className="flex items-center gap-2 text-sm text-ink">
              <User size={14} className="text-muted" />
              {client?.name ?? t('apptModal.client')}
            </div>
            {client?.phone && (
              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                <Phone size={13} />
                {client.phone}
              </div>
            )}
            {client?.email && (
              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                <Mail size={13} />
                {client.email}
              </div>
            )}
          </section>

          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t('apptModal.stylist')}</p>
            <div className="flex items-center gap-2 text-sm text-ink">
              <Scissors size={14} className="text-muted" />
              {stylist?.name ?? '—'}
            </div>
          </section>

          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {t('apptModal.service', { count: apptServices.length })}
            </p>
            <ul className="flex flex-col gap-1">
              {apptServices.map((s) => (
                <li key={s._id} className="flex items-center justify-between text-sm text-ink">
                  <span>{s.name}</span>
                  <span className="tabnums text-muted">
                    {s.durationMin} min · {formatMoney(s.price)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-sm font-medium text-ink">
              <span>{t('apptModal.total')}</span>
              <span className="tabnums">
                {totalDur} min · {formatMoney(appt.price)}
              </span>
            </div>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
