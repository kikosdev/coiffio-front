/**
 * Interface du store CRUD canonique (Sprint 2) — TEMPLATE réutilisé par tous les
 * modules suivants (clients, services, team, stock, …). Voir clientStore.ts pour
 * l'implémentation de référence : scope respecté côté API, enveloppe déballée par
 * l'api client, optimistic UI sur create/update.
 */
export interface Entity {
  _id: string;
}

export interface CrudStore<T extends Entity, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  items: T[];
  loading: boolean;
  error: string | null;
  fetch: (params?: Record<string, unknown>) => Promise<void>;
  create: (dto: CreateDto) => Promise<T>;
  update: (id: string, dto: UpdateDto) => Promise<T>;
  remove: (id: string) => Promise<void>;
}
