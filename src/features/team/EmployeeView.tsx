import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Wallet } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { useTeamStore } from './teamStore';
import { RotaEditor } from './RotaEditor';
import { LeaveRequestModal } from './LeaveRequestModal';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const LEVEL_LABEL: Record<string, string> = { master: 'Master', senior: 'Senior', apprentice: 'Apprenti' };

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-ivory/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink tabnums">{value}</p>
    </div>
  );
}

/**
 * Vue employé « Your standing » (#9) : le stylist courant ne voit QUE ses propres chiffres
 * (paie/commission/tips), ses shifts à venir et sa rota (lecture seule). Soumet ses congés.
 */
export function EmployeeView() {
  const user = useAuthStore((s) => s.user);
  const standing = useTeamStore((s) => s.standing);
  const loading = useTeamStore((s) => s.standingLoading);
  const fetchStanding = useTeamStore((s) => s.fetchStanding);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void fetchStanding();
  }, [fetchStanding]);

  return (
    <div className="mx-auto max-w-11xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-medium text-ink">Your standing</h2>
          <p className="text-sm text-muted">Vos chiffres, vos shifts à venir &amp; vos congés.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Demander un congé
        </Button>
      </div>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Wallet size={18} /> Rémunération
            </span>
          </CardTitle>
          {standing?.level && <Badge tone="champagne">{LEVEL_LABEL[standing.level] ?? standing.level}</Badge>}
        </CardHeader>
        <CardBody>
          {loading && !standing ? (
            <p className="py-6 text-center text-sm text-muted">Chargement…</p>
          ) : standing ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Figure label="Taux de base" value={`${standing.baseRate} TND`} />
                <Figure label="Commission" value={`${standing.commissionPct}%`} />
                <Figure label="Comm. estimée" value={`${standing.estimatedCommission} TND`} />
                <Figure label="Pourboires" value={`${standing.tips} TND`} />
              </div>
              <p className="mt-3 text-xs text-muted">
                {standing.completedCount} RDV réalisés · {standing.upcomingCount} à venir · base brute services{' '}
                {standing.grossServices} TND. Pourboires détaillés au Sprint 5 (La Caisse).
              </p>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted">Aucune donnée.</p>
          )}
        </CardBody>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={18} /> Shifts à venir
            </span>
          </CardTitle>
        </CardHeader>
        <CardBody>
          {standing && standing.upcomingShifts.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {standing.upcomingShifts.map((sh) => (
                <li key={sh.date} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
                  <span className="w-10 text-muted">{DAYS[new Date(`${sh.date}T00:00:00Z`).getUTCDay()]}</span>
                  <span className="tabnums text-ink">{sh.date}</span>
                  <span className="tabnums ml-auto text-muted">
                    {sh.start}–{sh.end}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-muted">Aucun shift dans les 7 prochains jours.</p>
          )}
        </CardBody>
      </Card>

      {user && (
        <div>
          <h3 className="mb-3 font-serif text-xl text-ink">Ma rota</h3>
          <RotaEditor stylistId={user.id} canEdit={false} />
        </div>
      )}

      <LeaveRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
