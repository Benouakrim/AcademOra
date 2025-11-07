

type Props = {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  label?: string
}

export default function MultiSelectPills({ options, value, onChange, label }: Props) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt))
    else onChange([...value, opt])
  }

  return (
    <div className="space-y-2.5">
      {label && <div className="text-sm font-semibold text-slate-800 tracking-tight">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value.includes(o)
          return (
            <button
              key={o}
              onClick={() => toggle(o)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'border-transparent bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}
