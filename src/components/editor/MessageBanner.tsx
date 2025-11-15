export default function MessageBanner({ type, text }: { type: 'error' | 'success'; text: string }) {
  const cls = type === 'error'
    ? 'bg-red-50 backdrop-blur-sm border-b border-red-200 text-red-700'
    : 'bg-green-50 backdrop-blur-sm border-b border-green-200 text-green-700'
  return (
    <div className={`${cls} px-6 py-3 text-sm animate-slideDown shadow-md`}>{text}</div>
  )
}
