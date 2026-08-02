interface Props {
  value: number // 0-100
  label: string
  sublabel?: string
  size?: number
}

function colorFor(value: number) {
  if (value >= 70) return '#10B981'
  if (value >= 40) return '#F59E0B'
  return '#EF4444'
}

export default function GaugeMeter({ value, label, sublabel, size = 200 }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = size / 2 - 14
  const circumference = Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const color = colorFor(clamped)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path
          d={`M 14 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 14} ${size / 2}`}
          fill="none"
          stroke="#16283D"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={`M 14 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 14} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
        />
        <text x="50%" y={size / 2 - 6} textAnchor="middle" className="fill-text" fontSize={size * 0.16} fontWeight={700}>
          {Math.round(clamped)}
        </text>
      </svg>
      <p className="mt-1 text-sm font-semibold text-text">{label}</p>
      {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
    </div>
  )
}
