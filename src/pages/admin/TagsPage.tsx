export default function TagsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tags</h1>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-gray-600 mb-4">Coming soon: tag management (create, edit, delete).</p>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Backed by Supabase table: <code>tags</code></li>
            <li>Fields: <code>id</code>, <code>name</code>, <code>slug</code>, <code>created_at</code></li>
            <li>Used to categorize articles and resources</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


