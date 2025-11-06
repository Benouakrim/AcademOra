import { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import { savedItemsAPI, getCurrentUser } from '../lib/api'

interface SaveButtonProps {
  itemType: 'article' | 'resource' | 'university' | 'university_group'
  itemId: string
  itemData?: any
  className?: string
}

export default function SaveButton({ itemType, itemId, itemData, className = '' }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      setChecking(false)
      return
    }

    async function checkSaved() {
      try {
        const result = await savedItemsAPI.checkIfSaved(itemType, itemId)
        setIsSaved(result.saved)
      } catch (error) {
        console.error('Error checking saved status:', error)
      } finally {
        setChecking(false)
      }
    }

    checkSaved()
  }, [itemType, itemId])

  const handleToggle = async () => {
    const user = getCurrentUser()
    if (!user) {
      alert('Please log in to save items')
      return
    }

    setLoading(true)
    try {
      if (isSaved) {
        await savedItemsAPI.unsaveItem(itemType, itemId)
        setIsSaved(false)
      } else {
        await savedItemsAPI.saveItem(itemType, itemId, itemData)
        setIsSaved(true)
      }
    } catch (error: any) {
      alert('Failed to ' + (isSaved ? 'unsave' : 'save') + ' item: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <button
        disabled
        className={`px-3 py-2 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed ${className}`}
      >
        <Save className="h-4 w-4 inline mr-2" />
        Loading...
      </button>
    )
  }

  // Default styling
  const defaultClasses = isSaved
    ? 'border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-100'
    : 'border-gray-300 text-gray-700 hover:bg-gray-50'

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-2 rounded-lg border transition-colors ${className ? className : defaultClasses}`}
    >
      {isSaved ? (
        <>
          <X className="h-4 w-4 inline mr-2" />
          {loading ? 'Unsaving...' : 'Unsave'}
        </>
      ) : (
        <>
          <Save className="h-4 w-4 inline mr-2" />
          {loading ? 'Saving...' : 'Save'}
        </>
      )}
    </button>
  )
}

