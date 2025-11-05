

type Props = {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  label?: string
}

export default function RangeSlider({ value, min = 0, max = 100, step = 1, onChange, label }: Props) {
  return (
    <div className="space-y-2">
      {label && <div className="text-xs font-medium text-gray-600">{label}</div>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg accent-primary-500"
        />
        <div className="w-12 text-right text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
