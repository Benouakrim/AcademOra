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
    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-md rounded-xl overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-primary-600 bg-primary-50 rounded-md">{icon}</div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors ${isEnabled ? 'bg-primary-500' : 'bg-gray-300'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-6' : ''}`} />
          </div>
        </label>
      </div>

      <div className={`p-4 transition-all ${!isEnabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  )
}
