import { icons, type LucideProps } from 'lucide-react';

export type IconName = keyof typeof icons;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

/** Wrapper Lucide — usage : `<Icon name="Calendar" size={18} />`. */
export function Icon({ name, size = 18, strokeWidth = 1.75, ...rest }: IconProps) {
  const Cmp = icons[name];
  if (!Cmp) return null;
  return <Cmp size={size} strokeWidth={strokeWidth} {...rest} />;
}
