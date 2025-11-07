import type { ReactNode } from 'react'

type Props = {
  title: string
  icon?: React.ReactNode
  isEnabled: boolean
  onToggle: (v: boolean) => void
  children?: ReactNode
}

export default function MixerModule({ title, icon, isEnabled, onToggle, children }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-inner">
            {icon}
          </div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <label className="relative inline-flex h-7 w-14 cursor-pointer items-center rounded-full bg-slate-200 transition-colors duration-200">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-primary-500" />
          <span className="absolute left-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-7" />
        </label>
      </div>

      <div className={`px-5 pb-5 pt-0 transition-all ${!isEnabled ? 'pointer-events-none opacity-50 grayscale' : ''}`}>
        {children}
      </div>
    </div>
  )
}
