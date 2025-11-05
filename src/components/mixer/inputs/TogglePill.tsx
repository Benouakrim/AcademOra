// No React default import needed with the new JSX transform

type Props = {
  active: boolean
  label?: string
  onClick?: () => void
}

export default function TogglePill({ active, label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-transform ${active ? 'bg-primary-600 text-white scale-105 shadow' : 'bg-gray-100 text-gray-800'}`}
    >
      {label}
    </button>
  )
}
