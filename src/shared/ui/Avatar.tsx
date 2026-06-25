interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '');
}

/** Avatar image ou initiales sur dégradé champagne. */
export function Avatar({ name, src, size = 40, className = '' }: AvatarProps) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        style={style}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-champagne-deep font-serif italic text-white ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initials(name).toUpperCase()}</span>
    </div>
  );
}
