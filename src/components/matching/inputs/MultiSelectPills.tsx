

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
    <div className="space-y-2">
      {label && <div className="text-xs font-medium text-gray-600">{label}</div>}
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => {
          const active = value.includes(o)
          return (
            <button
              key={o}
              onClick={() => toggle(o)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-shadow border ${
                active
                  ? 'bg-primary-100 border-primary-500 text-primary-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700'
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
