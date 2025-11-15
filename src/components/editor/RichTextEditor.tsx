import { Editor } from '@tiptap/react'
import EditorToolbar from '../EditorToolbar'
import { EditorContent } from '@tiptap/react'

export default function RichTextEditor({ editor }: { editor: Editor | null }) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="animate-slideDown">
        <EditorToolbar editor={editor} />
      </div>
      <div className="flex-1 overflow-y-auto bg-[var(--color-bg-secondary)] scrollbar-thin transition-all">
        <div className="max-w-5xl mx-auto animate-fadeIn">
          <EditorContent editor={editor as any} />
        </div>
      </div>
    </div>
  )
}
