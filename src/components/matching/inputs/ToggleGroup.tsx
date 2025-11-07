

type Option = { value: string; label?: string }

type Props = {
  options: Option[]
  value?: string
  onChange: (v: string) => void
  label?: string
}

export default function ToggleGroup({ options, value, onChange, label }: Props) {
  return (
    <div className="space-y-2.5">
      {label && <div className="text-sm font-semibold text-slate-800 tracking-tight">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'border-transparent bg-primary-600 text-white shadow'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-600'
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
