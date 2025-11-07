import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usersPublicAPI } from '../lib/api'
import SavedItemsCollaboration from '../components/SavedItemsCollaboration'

export default function PublicUserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const data = await usersPublicAPI.getPublicProfile(username || '')
        if (!mounted) return
        setProfile(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    if (username) load()
    return () => { mounted = false }
  }, [username])

  if (loading) return (<div className="container mx-auto px-4 py-8">Loading...</div>)
  if (error || !profile) return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white border rounded-lg p-8 text-center">{error || 'Profile not found'}</div>
    </div>
  )

  const isPrivate = profile.is_profile_public === false

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <img src={profile.avatar_url || ''} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} alt="avatar" className="w-20 h-20 rounded-full object-cover border" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.full_name || profile.username || 'User'}</h1>
              {profile.username && <span className="text-sm text-gray-500">@{profile.username}</span>}
            </div>
            {profile.title && <div className="text-gray-700">{profile.title}</div>}
            {profile.headline && <div className="text-gray-600 text-sm">{profile.headline}</div>}
            {profile.location && <div className="text-gray-500 text-sm mt-1">{profile.location}</div>}
          </div>
        </div>

        {isPrivate ? (
          <div className="mt-6 text-gray-600">This profile is private.</div>
        ) : (
          <>
            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Badges</div>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((b: any, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs border">{b.badges?.name || b.badges?.slug}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">About</div>
                <div className="text-gray-800 text-sm whitespace-pre-line">{profile.bio}</div>
              </div>
            )}

            {/* Socials */}
            {(profile.website_url || profile.linkedin_url || profile.github_url || profile.twitter_url || profile.portfolio_url) && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Links</div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {profile.website_url && <a className="text-primary-600" href={profile.website_url} target="_blank">Website</a>}
                  {profile.linkedin_url && <a className="text-primary-600" href={profile.linkedin_url} target="_blank">LinkedIn</a>}
                  {profile.github_url && <a className="text-primary-600" href={profile.github_url} target="_blank">GitHub</a>}
                  {profile.twitter_url && <a className="text-primary-600" href={profile.twitter_url} target="_blank">Twitter</a>}
                  {profile.portfolio_url && <a className="text-primary-600" href={profile.portfolio_url} target="_blank">Portfolio</a>}
                </div>
              </div>
            )}

            {/* Recent Reviews */}
            {profile.recent_reviews && profile.recent_reviews.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Recent Reviews</div>
                <div className="divide-y">
                  {profile.recent_reviews.map((r: any) => (
                    <div key={r.id} className="py-2 text-sm text-gray-800">
                      <div className="flex items-center justify-between">
                        <div>Rating: {r.rating}/5</div>
                        <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      {r.comment && <div className="text-gray-700 mt-1">{r.comment}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experiences */}
            {profile.experiences && profile.experiences.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Experience</div>
                <div className="space-y-3">
                  {profile.experiences.map((e: any) => (
                    <div key={e.id} className="border rounded p-3 text-sm">
                      <div className="font-semibold text-gray-900">{e.title} {e.company ? `• ${e.company}` : ''}</div>
                      <div className="text-gray-500 text-xs">{e.location || ''}</div>
                      <div className="text-gray-500 text-xs">{e.start_date || ''} {e.end_date ? `- ${e.end_date}` : e.current ? '- Present' : ''}</div>
                      {e.description && <div className="text-gray-700 mt-1 whitespace-pre-line">{e.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Education</div>
                <div className="space-y-3">
                  {profile.education.map((ed: any) => (
                    <div key={ed.id} className="border rounded p-3 text-sm">
                      <div className="font-semibold text-gray-900">{ed.school}</div>
                      <div className="text-gray-700">{ed.degree} {ed.field ? `— ${ed.field}` : ''}</div>
                      <div className="text-gray-500 text-xs">{ed.start_year || ''}{ed.end_year ? ` - ${ed.end_year}` : ''}</div>
                      {ed.description && <div className="text-gray-700 mt-1 whitespace-pre-line">{ed.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Projects</div>
                <div className="space-y-3">
                  {profile.projects.map((p: any) => (
                    <div key={p.id} className="border rounded p-3 text-sm">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      {p.role && <div className="text-gray-700">Role: {p.role}</div>}
                      {p.url && <a className="text-primary-600 text-sm" href={p.url} target="_blank">View</a>}
                      {p.description && <div className="text-gray-700 mt-1 whitespace-pre-line">{p.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">Certifications</div>
                <div className="space-y-3">
                  {profile.certifications.map((c: any) => (
                    <div key={c.id} className="border rounded p-3 text-sm">
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-gray-700">{c.issuer}</div>
                      <div className="text-gray-500 text-xs">{c.issue_date || ''}</div>
                      {c.credential_url && <a className="text-primary-600 text-sm" href={c.credential_url} target="_blank">Credential</a>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Items Collaboration */}
            <div className="mt-6">
              <SavedItemsCollaboration userId={profile.id} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}


