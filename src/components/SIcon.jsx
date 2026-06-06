import { useEffect, useRef } from 'react'

export default function SIcon({ name, size = 18, strokeWidth = 1.6, style, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || !window.lucide || !window.lucide.icons) return
    const pascal = name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('')
    const data = window.lucide.icons[pascal] || window.lucide.icons[name]
    if (!data) { ref.current.innerHTML = ''; return }
    let kids = []
    if (Array.isArray(data)) kids = data
    else if (data.iconNode) kids = data.iconNode
    const childSvg = kids.map((c) => {
      if (!Array.isArray(c)) return ''
      const tag = c[0]
      const attrs = c[1] || {}
      return `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`
    }).join('')
    const base = {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      width: size,
      height: size,
    }
    const baseStr = Object.entries(base).map(([k, v]) => `${k}="${v}"`).join(' ')
    ref.current.innerHTML = `<svg ${baseStr}>${childSvg}</svg>`
  }, [name, size, strokeWidth])
  return (
    <span
      ref={ref}
      className={className}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}
    />
  )
}
