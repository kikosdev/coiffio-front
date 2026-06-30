import { Card, CardBody, Icon, type IconName } from '@/shared/ui';

interface PlaceholderProps {
  title: string;
  icon: IconName;
  sprint: string;
}

/**
 * Écran placeholder V0 — le contenu réel arrive au sprint indiqué.
 * Démontre les tokens Ivory Éditorial et le layout responsive.
 */
export function Placeholder({ title, icon, sprint }: PlaceholderProps) {
  return (
    <div className="mx-auto max-w-11xl">
      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-champagne/15 text-champagne-deep">
            <Icon name={icon} size={26} />
          </div>
          <h2 className="font-serif text-3xl font-medium text-ink">
            {title}
          </h2>
          <p className="max-w-md text-sm text-muted">
            Cet écran est un placeholder du socle (Sprint 0). Son contenu fonctionnel sera livré au{' '}
            <span className="serif-em">{sprint}</span>.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
