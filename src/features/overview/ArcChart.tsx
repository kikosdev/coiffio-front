import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';

/** "Arc of the day" — vague de densité horaire (SVG, tokens Ivory Éditorial). */
export function ArcChart({ arc }: { arc: { hour: number; count: number }[] }) {
  const W = 720;
  const H = 180;
  const pad = 24;
  const max = Math.max(1, ...arc.map((a) => a.count));
  const step = (W - pad * 2) / Math.max(1, arc.length - 1);
  const pts = arc.map((a, i) => {
    const x = pad + i * step;
    const y = H - pad - (a.count / max) * (H - pad * 2);
    return { x, y, ...a };
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - pad} L ${pts[0].x.toFixed(1)} ${H - pad} Z`;

  return (
    <Card>
      <CardHeader><CardTitle>Arc of the day</CardTitle></CardHeader>
      <CardBody className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[560px] w-full" role="img" aria-label="Densité horaire des rendez-vous">
          <path d={area} fill="var(--champagne, #B89968)" fillOpacity={0.15} />
          <path d={line} fill="none" stroke="var(--champagne, #B89968)" strokeWidth={2} />
          {pts.map((p) => (
            <g key={p.hour}>
              <circle cx={p.x} cy={p.y} r={3} fill="var(--champagne-deep, #9A7B4F)" />
              <text x={p.x} y={H - 6} textAnchor="middle" fontSize={10} fill="#8A8076">{p.hour}h</text>
            </g>
          ))}
        </svg>
      </CardBody>
    </Card>
  );
}
