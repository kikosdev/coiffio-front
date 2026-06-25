import { useEffect, useMemo, useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { Badge, Button, Input, Modal } from '@/shared/ui';
import { ApiError } from '@/shared/api/client';
import { useServiceStore } from '@/features/services/serviceStore';
import { useClientStore } from '@/features/clients/clientStore';
import { useBookingStore } from './bookingStore';

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate: string; // YYYY-MM-DD
  onBooked?: () => void;
}

/**
 * Création d'un RDV au backoffice (source 'phone') : service(s) chaînés (#3) → date →
 * disponibilité live (#1) → stylist + créneau → client (existant ou nouveau, merge-on-phone #10).
 * Le 409 (créneau pris entre-temps) est géré : on invite à re-choisir un créneau.
 */
export function NewAppointmentModal({ open, onClose, defaultDate, onBooked }: NewAppointmentModalProps) {
  const services = useServiceStore((s) => s.items);
  const fetchServices = useServiceStore((s) => s.fetch);
  const clients = useClientStore((s) => s.items);
  const fetchClients = useClientStore((s) => s.fetch);
  const setClientQuery = useClientStore((s) => s.setQuery);

  const availability = useBookingStore((s) => s.availability);
  const availabilityLoading = useBookingStore((s) => s.availabilityLoading);
  const fetchAvailability = useBookingStore((s) => s.fetchAvailability);
  const clearAvailability = useBookingStore((s) => s.clearAvailability);
  const book = useBookingStore((s) => s.book);

  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState(defaultDate);
  const [slot, setSlot] = useState<{ stylistId: string; start: string } | null>(null);
  const [newClient, setNewClient] = useState(true);
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (services.length === 0) void fetchServices();
      void fetchClients();
      setDate(defaultDate);
    }
  }, [open, defaultDate, services.length, fetchServices, fetchClients]);

  useEffect(() => {
    setSlot(null);
    if (open && selected.length > 0 && date) void fetchAvailability(selected, date);
    else clearAvailability();
  }, [open, selected, date, fetchAvailability, clearAvailability]);

  const totals = useMemo(() => {
    const chosen = services.filter((s) => selected.includes(s._id));
    return {
      need: chosen.reduce((a, s) => a + s.durationMin + s.bufferMin, 0),
      price: chosen.reduce((a, s) => a + s.price, 0),
    };
  }, [services, selected]);

  const toggleService = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canSubmit = selected.length > 0 && !!slot && (newClient ? name && phone : clientId) && !submitting;

  const submit = async () => {
    if (!slot) return;
    setError(null);
    setSubmitting(true);
    try {
      await book({
        serviceIds: selected,
        stylistId: slot.stylistId,
        start: slot.start,
        source: 'phone',
        ...(newClient ? { clientName: name, clientPhone: phone, clientEmail: email || undefined } : { clientId }),
      });
      setSelected([]);
      setSlot(null);
      setName('');
      setPhone('');
      setEmail('');
      setClientId('');
      onBooked?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError('Ce créneau vient d’être pris. Choisissez-en un autre.');
        setSlot(null);
        if (selected.length > 0 && date) void fetchAvailability(selected, date);
      } else {
        setError(err instanceof ApiError ? err.message : 'Réservation impossible.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="md:w-[560px]"
      title="Nouveau rendez-vous"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} loading={submitting} disabled={!canSubmit}>
            Confirmer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">1 · Services</p>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <button
                key={s._id}
                onClick={() => toggleService(s._id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selected.includes(s._id) ? 'border-ink bg-ink text-ivory' : 'border-line text-ink hover:border-champagne'
                }`}
              >
                {s.name} · {s.price}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted">
              <Clock size={13} /> {totals.need} min · {totals.price} TND
              {selected.length > 1 && (
                <Badge tone="champagne" className="ml-1">
                  chaîné
                </Badge>
              )}
            </p>
          )}
        </section>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">2 · Date</p>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
        </section>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">3 · Créneau</p>
          {selected.length === 0 ? (
            <p className="text-sm text-muted">Sélectionnez d'abord un service.</p>
          ) : availabilityLoading ? (
            <p className="text-sm text-muted">Calcul des disponibilités…</p>
          ) : availability.length === 0 ? (
            <p className="text-sm text-muted">Aucun stylist disponible ce jour.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {availability.map((a) => (
                <div key={a.stylistId}>
                  <p className="mb-1 text-sm font-medium text-ink">{a.stylistName}</p>
                  {a.slots.length === 0 ? (
                    <p className="text-xs text-muted">Complet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {a.slots.map((sl) => {
                        const active = slot?.stylistId === a.stylistId && slot?.start === sl.start;
                        return (
                          <button
                            key={sl.start}
                            onClick={() => setSlot({ stylistId: a.stylistId, start: sl.start })}
                            className={`tabnums rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                              active ? 'border-champagne bg-champagne/15 text-champagne-deep' : 'border-line text-ink hover:border-champagne'
                            }`}
                          >
                            {sl.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">4 · Client</p>
          <div className="mb-2 flex gap-2">
            <button
              onClick={() => setNewClient(true)}
              className={`rounded-full px-3 py-1 text-sm ${newClient ? 'bg-ink text-ivory' : 'border border-line text-muted'}`}
            >
              Nouveau
            </button>
            <button
              onClick={() => setNewClient(false)}
              className={`rounded-full px-3 py-1 text-sm ${!newClient ? 'bg-ink text-ivory' : 'border border-line text-muted'}`}
            >
              Client existant
            </button>
          </div>
          {newClient ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input placeholder="Email (optionnel)" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                icon={<Search size={14} />}
                placeholder="Rechercher un client…"
                onChange={(e) => {
                  setClientQuery(e.target.value);
                  void fetchClients();
                }}
              />
              <div className="max-h-32 overflow-y-auto rounded-lg border border-line">
                {clients.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setClientId(c._id)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-line/30 ${
                      clientId === c._id ? 'bg-champagne/10' : ''
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="tabnums text-xs text-muted">{c.phone}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </Modal>
  );
}
