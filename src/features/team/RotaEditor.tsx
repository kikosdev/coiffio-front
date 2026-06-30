import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input } from '@/shared/ui';
import { useTeamStore, type ScheduleOverride, type WeeklyShift } from './teamStore';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const OVERRIDE_TONE: Record<ScheduleOverride['type'], 'error' | 'pending' | 'champagne'> = {
  off: 'error',
  leave: 'pending',
  custom: 'champagne',
};

interface DayRow {
  enabled: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
  hasBreak: boolean;
}

interface RotaEditorProps {
  stylistId: string;
  canEdit: boolean;
}

/**
 * Éditeur de rota hebdomadaire (weekly + breaks) + overrides (off/leave/custom).
 * Édition = owner·manager. Le Schedule édité ici EST la source de vérité lue par le
 * booking engine. Mobile : la grille hebdo scrolle en x DANS la card (contrat responsive).
 * Les jours fermés du salon sont grisés et non-cochables.
 */
export function RotaEditor({ stylistId, canEdit }: RotaEditorProps) {
  const schedule = useTeamStore((s) => s.schedule);
  const fetchSchedule = useTeamStore((s) => s.fetchSchedule);
  const saveWeekly = useTeamStore((s) => s.saveWeekly);
  const addOverride = useTeamStore((s) => s.addOverride);
  const removeOverride = useTeamStore((s) => s.removeOverride);
  const salonHours = useTeamStore((s) => s.salonHours);
  const fetchSalonHours = useTeamStore((s) => s.fetchSalonHours);

  const [rows, setRows] = useState<DayRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ov, setOv] = useState<ScheduleOverride>({ date: '', type: 'off' });

  // Map day → salon hours for O(1) lookup
  const salonMap = useMemo(
    () => new Map(salonHours.map((h) => [h.day, h])),
    [salonHours],
  );

  useEffect(() => {
    void fetchSchedule(stylistId);
    void fetchSalonHours();
  }, [stylistId, fetchSchedule, fetchSalonHours]);

  useEffect(() => {
    const base: DayRow[] = DAYS.map((_, day) => {
      const shift = schedule?.weekly.find((w) => w.day === day);
      const salon = salonMap.get(day);
      const defaultStart = salon?.start ?? '09:00';
      const defaultEnd = salon?.end ?? '18:00';
      const br = shift?.breaks?.[0];
      return shift
        ? {
            enabled: true,
            start: shift.start,
            end: shift.end,
            breakStart: br?.start ?? '13:00',
            breakEnd: br?.end ?? '14:00',
            hasBreak: !!br,
          }
        : { enabled: false, start: defaultStart, end: defaultEnd, breakStart: '13:00', breakEnd: '14:00', hasBreak: false };
    });
    setRows(base);
  }, [schedule, salonMap]);

  const setRow = (i: number, patch: Partial<DayRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const onToggleDay = (day: number, checked: boolean) => {
    const salon = salonMap.get(day);
    // Snap default times to salon open/close when enabling the day
    if (checked && salon?.isOpen) {
      setRow(day, { enabled: true, start: salon.start, end: salon.end });
    } else {
      setRow(day, { enabled: checked });
    }
  };

  const onSave = async () => {
    setSaveError(null);
    // Frontend pre-validation against salon hours
    for (let day = 0; day < rows.length; day++) {
      const r = rows[day];
      if (!r.enabled) continue;
      const salon = salonMap.get(day);
      if (salon && !salon.isOpen) {
        setSaveError(`Le salon est fermé le ${DAYS[day]}. Décochez ce jour.`);
        return;
      }
      if (salon) {
        if (r.start < salon.start) {
          setSaveError(`${DAYS[day]} : début (${r.start}) avant l'ouverture du salon (${salon.start}).`);
          return;
        }
        if (r.end > salon.end) {
          setSaveError(`${DAYS[day]} : fin (${r.end}) après la fermeture du salon (${salon.end}).`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const weekly: WeeklyShift[] = rows
        .map((r, day) => ({ r, day }))
        .filter(({ r }) => r.enabled)
        .map(({ r, day }) => ({
          day,
          start: r.start,
          end: r.end,
          breaks: r.hasBreak ? [{ start: r.breakStart, end: r.breakEnd }] : [],
        }));
      await saveWeekly(stylistId, weekly);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const onAddOverride = async () => {
    if (!ov.date) return;
    await addOverride(stylistId, ov);
    setOv({ date: '', type: 'off' });
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Rota hebdomadaire</CardTitle>
          {canEdit && (
            <Button size="sm" leftIcon={<Save size={14} />} onClick={onSave} loading={saving}>
              Enregistrer
            </Button>
          )}
        </CardHeader>
        {/* Scroll-x DANS la card en mobile (jamais perdre de colonne). */}
        <CardBody className="overflow-x-auto">
          <div className="flex min-w-[520px] flex-col gap-2">
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted">
              <span className="w-24">Jour</span>
              <span className="w-44">Service</span>
              <span className="w-44">Pause</span>
            </div>
            {rows.map((r, day) => {
              const salon = salonMap.get(day);
              const isSalonClosed = salon ? !salon.isOpen : false;
              const minTime = salon?.start;
              const maxTime = salon?.end;

              return (
                <div key={day} className="flex items-center gap-3">
                  <label className={`flex w-24 items-center gap-2 text-sm ${isSalonClosed ? 'text-muted' : 'text-ink'}`}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#B89968]"
                      checked={r.enabled && !isSalonClosed}
                      disabled={!canEdit || isSalonClosed}
                      onChange={(e) => onToggleDay(day, e.target.checked)}
                    />
                    {DAYS[day]}
                    {isSalonClosed && (
                      <span className="text-xs font-medium text-error">Fermé</span>
                    )}
                  </label>
                  <div className="flex w-44 items-center gap-1">
                    <input
                      type="time"
                      disabled={!canEdit || !r.enabled || isSalonClosed}
                      value={r.start}
                      min={minTime}
                      max={r.end}
                      onChange={(e) => setRow(day, { start: e.target.value })}
                      className="h-9 rounded-lg border border-lineStrong bg-surface px-2 text-sm tabnums disabled:opacity-40"
                    />
                    <span className="text-muted">—</span>
                    <input
                      type="time"
                      disabled={!canEdit || !r.enabled || isSalonClosed}
                      value={r.end}
                      min={r.start}
                      max={maxTime}
                      onChange={(e) => setRow(day, { end: e.target.value })}
                      className="h-9 rounded-lg border border-lineStrong bg-surface px-2 text-sm tabnums disabled:opacity-40"
                    />
                  </div>
                  <div className="flex w-44 items-center gap-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#B89968]"
                      checked={r.hasBreak}
                      disabled={!canEdit || !r.enabled || isSalonClosed}
                      onChange={(e) => setRow(day, { hasBreak: e.target.checked })}
                      aria-label="Pause"
                    />
                    <input
                      type="time"
                      disabled={!canEdit || !r.enabled || !r.hasBreak || isSalonClosed}
                      value={r.breakStart}
                      onChange={(e) => setRow(day, { breakStart: e.target.value })}
                      className="h-9 w-[5.5rem] rounded-lg border border-lineStrong bg-surface px-2 text-sm tabnums disabled:opacity-40"
                    />
                    <span className="text-muted">—</span>
                    <input
                      type="time"
                      disabled={!canEdit || !r.enabled || !r.hasBreak || isSalonClosed}
                      value={r.breakEnd}
                      onChange={(e) => setRow(day, { breakEnd: e.target.value })}
                      className="h-9 w-[5.5rem] rounded-lg border border-lineStrong bg-surface px-2 text-sm tabnums disabled:opacity-40"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {saveError && (
            <p className="mt-3 text-sm font-medium text-error">{saveError}</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exceptions (overrides)</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {(schedule?.overrides.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">Aucune exception.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {schedule?.overrides
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((o) => (
                  <li key={o.date} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
                    <span className="tabnums text-sm text-ink">{o.date}</span>
                    <Badge tone={OVERRIDE_TONE[o.type]}>{o.type}</Badge>
                    {o.type === 'custom' && (
                      <span className="tabnums text-xs text-muted">
                        {o.start}–{o.end}
                      </span>
                    )}
                    {o.note && <span className="truncate text-xs text-muted">{o.note}</span>}
                    {canEdit && (
                      <button
                        onClick={() => removeOverride(stylistId, o.date)}
                        className="ml-auto text-muted hover:text-error"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          )}

          {canEdit && (
            <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
              <Input
                label="Date"
                type="date"
                value={ov.date}
                onChange={(e) => setOv((p) => ({ ...p, date: e.target.value }))}
                className="w-40"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-muted">Type</label>
                <select
                  value={ov.type}
                  onChange={(e) => setOv((p) => ({ ...p, type: e.target.value as ScheduleOverride['type'] }))}
                  className="h-10 rounded-xl border border-lineStrong bg-surface px-3 text-sm text-ink outline-none focus:border-champagne"
                >
                  <option value="off">Off</option>
                  <option value="leave">Leave</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {ov.type === 'custom' && (
                <>
                  <Input
                    label="Début"
                    type="time"
                    value={ov.start ?? ''}
                    onChange={(e) => setOv((p) => ({ ...p, start: e.target.value }))}
                    className="w-28"
                  />
                  <Input
                    label="Fin"
                    type="time"
                    value={ov.end ?? ''}
                    onChange={(e) => setOv((p) => ({ ...p, end: e.target.value }))}
                    className="w-28"
                  />
                </>
              )}
              <Button leftIcon={<Plus size={15} />} onClick={onAddOverride}>
                Ajouter
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
