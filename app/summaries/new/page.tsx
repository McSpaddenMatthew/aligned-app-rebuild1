// app/summaries/new/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '../../../lib/supabase-browser'

export default function NewSummaryPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const loggedIn = Boolean(data.user)
      setAuthed(loggedIn)
      setLoading(false)
      if (!loggedIn) router.push('/login')
    })
  }, [router, supabase])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      alert('Please add a title and some content.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Not authenticated')
      return
    }

    const { error } = await supabase
      .from('summaries')
      .insert({ title, body, user_id: user.id }) // belt-and-suspenders

    if (error) {
      alert(error.message)
      return
    }
    router.push('/summaries')
  }

  function copyPreview() {
    navigator.clipboard.writeText(body).then(() => {
      alert('Copied to clipboard!')
    })
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (!authed) return null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Candidate Summary</h1>
      <p className="text-sm mb-6">
        Paste or type your summary below. The right panel is the email-ready preview. Click “Copy” to drop it into an email.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full border rounded-xl p-3 outline-none"
              placeholder="e.g., VP Data Strategy — Candidate Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Summary (email-ready)</label>
            <textarea
              className="w-full h-80 border rounded-xl p-3 outline-none"
              placeholder={`Paste your candidate summary here…\n\nRecommended order:\n1) What You Shared – What the Candidate Brings (quotes)\n2) Why This Candidate Was Selected\n3) Known Risks & Mitigations\n4) Outcomes Delivered\n5) How [Name] Frames Data for Leadership Decisions\n6) Next Steps + scheduling line`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="rounded-2xl px-5 py-2 border">Save</button>
            <button type="button" onClick={copyPreview} className="rounded-2xl px-5 py-2 border">Copy</button>
          </div>
        </form>

        <div className="border rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wide mb-2 opacity-70">Email Preview</div>
          <div className="text-lg font-medium mb-2">{title || 'Untitled Summary'}</div>
          <pre className="whitespace-pre-wrap leading-6">{body || 'Your summary will appear here…'}</pre>
        </div>
      </div>
    </div>
  )
}
