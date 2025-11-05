

type Option = { value: string; label?: string }

type Props = {
  options: Option[]
  value?: string
  onChange: (v: string) => void
  label?: string
}

export default function ToggleGroup({ options, value, onChange, label }: Props) {
  return (
    <div className="space-y-2">
      {label && <div className="text-xs font-medium text-gray-600">{label}</div>}
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-100 border-primary-500 text-primary-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              {o.label || o.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
