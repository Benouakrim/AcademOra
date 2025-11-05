// No React default import needed with the new JSX transform

type Props = {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
}

export default function DialKnob({ value, min = 1, max = 10, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shadow">
        <div className="text-sm font-semibold">{value}</div>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e)=> onChange(Number(e.target.value))} className="w-full" />
    </div>
  )
}
