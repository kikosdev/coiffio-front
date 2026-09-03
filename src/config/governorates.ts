/** Liste fermée des 24 gouvernorats tunisiens — sélecteur région (hero plateforme, étape I du booking). */
export interface Governorate {
  value: string;
  label: string;
}

export const TUNISIA_GOVERNORATES: Governorate[] = [
  { value: 'Ariana', label: 'Ariana' },
  { value: 'Béja', label: 'Béja' },
  { value: 'Ben Arous', label: 'Ben Arous' },
  { value: 'Bizerte', label: 'Bizerte' },
  { value: 'Gabès', label: 'Gabès' },
  { value: 'Gafsa', label: 'Gafsa' },
  { value: 'Jendouba', label: 'Jendouba' },
  { value: 'Kairouan', label: 'Kairouan' },
  { value: 'Kasserine', label: 'Kasserine' },
  { value: 'Kébili', label: 'Kébili' },
  { value: 'Kef', label: 'Le Kef' },
  { value: 'Mahdia', label: 'Mahdia' },
  { value: 'Manouba', label: 'Manouba' },
  { value: 'Médenine', label: 'Médenine' },
  { value: 'Monastir', label: 'Monastir' },
  { value: 'Nabeul', label: 'Nabeul' },
  { value: 'Sfax', label: 'Sfax' },
  { value: 'Sidi Bouzid', label: 'Sidi Bouzid' },
  { value: 'Siliana', label: 'Siliana' },
  { value: 'Sousse', label: 'Sousse' },
  { value: 'Tataouine', label: 'Tataouine' },
  { value: 'Tozeur', label: 'Tozeur' },
  { value: 'Tunis', label: 'Tunis' },
  { value: 'Zaghouan', label: 'Zaghouan' },
];
