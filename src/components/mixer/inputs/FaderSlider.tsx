// No React default import needed with the new JSX transform

type Props = {
  label?: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  vertical?: boolean
}

export default function FaderSlider({ label, value, min = 0, max = 100, step = 1, onChange, vertical = false }: Props) {
  return (
    <div className="flex items-center gap-3">
      {label && <div className="text-xs font-medium text-gray-600 w-28">{label}</div>}
      <div className={`${vertical ? 'h-40 w-8' : 'w-full'} flex items-center`}> 
        <input
          type="range"
          className={`appearance-none ${vertical ? 'rotate-90' : ''} h-2 w-full bg-gray-200 rounded-lg`} 
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="text-sm text-gray-700 w-12 text-right">{value}</div>
    </div>
  )
}
