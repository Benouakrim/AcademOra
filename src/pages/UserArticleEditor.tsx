import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useArticleEditor } from '../hooks/useArticleEditor'
import { getCurrentUser } from '../lib/api'
import EditorHeader from '../components/editor/EditorHeader'
import SidebarSettings from '../components/editor/SidebarSettings'
import SEOSidebar from '../components/editor/SEOSidebar'
import type { EditorFormData } from '../hooks/useArticleEditor'
import MessageBanner from '../components/editor/MessageBanner'
import RichTextEditor from '../components/editor/RichTextEditor'
import '../styles/editor.css'

export default function UserArticleEditor() {
	const { id } = useParams()
	const navigate = useNavigate()
	// Ensure user is authenticated via effect to avoid render side-effects
	const [authChecking, setAuthChecking] = useState(true)
	useEffect(() => {
		const user = getCurrentUser() as any
		if (!user) {
			navigate('/login')
			return
		}
		setAuthChecking(false)
	}, [navigate])
	const {
		isEditMode,
		loading,
		saving,
		error,
		message,
		categories,
		termsByTaxonomy,
		TAXONOMY_KEYS,
		submissionLimit,
		formData,
		handleTitleChange,
		handleInputChange,
		handleExcerptChange,
		toggleTerm,
		editor,
		userSave,
	} = useArticleEditor('user', id)

	const setSlug = (v: string) => handleInputChange('slug', v)
	const setCategory = (v: string) => handleInputChange('category', v)
	const setFeatured = (v: string) => handleInputChange('featured_image', v)
	const setPublished = (v: boolean) => handleInputChange('published', v as any)

	if (authChecking || loading) {
		return (
			<div className="bg-gray-50 min-h-screen py-12">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center py-20">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
						<p className="mt-4 text-gray-600">Loading...</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[var(--color-bg-primary)]">
			<div className="flex h-screen">
				<div className="w-80 bg-[var(--color-bg-secondary)]/95 backdrop-blur-sm border-r border-[var(--color-border-primary)]/80 overflow-y-auto scrollbar-thin transition-all shadow-lg">
					<SidebarSettings
						formData={formData}
						setTitle={(v) => handleTitleChange(v)}
						setSlug={setSlug}
						setExcerpt={(v) => handleExcerptChange(v)}
						setCategory={setCategory}
						setFeatured={(v) => setFeatured(v as string)}
						setPublished={(v) => setPublished(v as boolean)}
						toggleTerm={toggleTerm}
						categories={categories.map((c) => ({ id: c.id, name: c.name }))}
						termsByTaxonomy={termsByTaxonomy}
						taxonomyKeys={TAXONOMY_KEYS}
						showTaxonomies={true}
						showPublished={false}
					/>
				</div>

				<div className="flex-1 flex flex-col bg-[var(--color-bg-primary)]">
					<EditorHeader
						backTo="/my-articles"
						saving={saving}
						mode="user"
						onUserDraft={async () => { await userSave('draft') }}
						onUserSubmit={async () => { await userSave('pending') }}
						disableUserSubmit={Boolean(submissionLimit && !submissionLimit.canSubmit && !isEditMode)}
					/>
					{error && <MessageBanner type="error" text={error} />}
					{message && <MessageBanner type="success" text={message} />}
					<form onSubmit={async (e) => { e.preventDefault(); await userSave('draft'); navigate('/my-articles') }} className="flex-1 flex flex-col overflow-hidden">
						<RichTextEditor editor={editor} />
					</form>
				</div>

				<div className="w-80 bg-[var(--color-bg-secondary)]/95 backdrop-blur-sm border-l border-[var(--color-border-primary)]/80 overflow-y-auto scrollbar-thin transition-all shadow-lg">
					<SEOSidebar
						open={true}
						setOpen={() => {}}
						formData={{
							focus_keyword: formData.focus_keyword,
							meta_title: formData.meta_title,
							meta_description: formData.meta_description,
							meta_keywords: formData.meta_keywords,
							og_image: formData.og_image,
							canonical_url: formData.canonical_url,
						}}
						setValue={(name: keyof EditorFormData, value: string) => handleInputChange(name, value)}
					/>
				</div>
			</div>
		</div>
	)
}
