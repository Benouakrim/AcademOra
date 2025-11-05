import React from 'react'

type Props = {
  icon?: React.ReactNode
  title: string
  isEnabled: boolean
  onToggle: (v: boolean) => void
  children?: React.ReactNode
}

export default function MixerModule({ icon, title, isEnabled, onToggle, children }: Props) {
  return (
    <section className="rounded-lg border border-white/40 bg-white/70 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary-600">{icon}</div>}
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>

        <div>
          <button
            aria-pressed={!isEnabled ? 'false' : 'true'}
            onClick={() => onToggle(!isEnabled)}
            className={`inline-flex h-8 w-14 rounded-full items-center p-1 transition-colors ${isEnabled ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            <span className={`h-6 w-6 rounded-full bg-white shadow transform transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className={isEnabled ? '' : 'opacity-40 grayscale pointer-events-none'}>
        {children}
      </div>
    </section>
  )
}
