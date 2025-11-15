import { Link } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'

interface EditorHeaderProps {
  backTo: string
  saving: boolean
  mode: 'admin' | 'user'
  onAdminSubmit?: () => void
  onUserDraft?: () => void
  onUserSubmit?: () => void
  disableUserSubmit?: boolean
}

export default function EditorHeader({ backTo, saving, mode, onAdminSubmit, onUserDraft, onUserSubmit, disableUserSubmit }: EditorHeaderProps) {
  return (
    <div className="bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border-b border-[var(--color-border-primary)] px-6 py-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={backTo}
            className="p-2 text-[var(--color-text-primary)]/70 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg)] rounded-lg transition-all duration-200 group"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full shadow-sm"></div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Article Editor</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to={backTo} 
            className="px-4 py-2 text-[var(--color-text-primary)]/80 bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200 hover:scale-105 border border-[var(--color-border-primary)]"
          >
            Cancel
          </Link>
          {mode === 'user' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onUserDraft}
                disabled={saving}
                className="px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg hover:opacity-90 transition-all disabled:opacity-50 border border-[var(--color-border-primary)]"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={onUserSubmit}
                disabled={saving || disableUserSubmit}
                className="px-5 py-2 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                title={disableUserSubmit ? 'Submission limit reached' : ''}
              >
                <Save className="h-4 w-4 inline mr-2" /> Submit for Review
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={onAdminSubmit}
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white rounded-lg hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
            >
              <Save className="h-4 w-4" />
              <span className="font-medium">{saving ? 'Saving...' : 'Save Article'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
