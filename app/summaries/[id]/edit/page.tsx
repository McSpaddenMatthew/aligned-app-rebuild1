// app/summaries/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '../../../../lib/supabase-browser'

export default function EditSummaryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const supabase = getSupabaseBrowser()

  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setAuthed(true)

      const { data, error } = await supabase
        .from('summaries')
        .select('title, body')
        .eq('id', params.id)
        .single()

      if (error) {
        alert(error.message)
        router.push('/summaries')
        return
      }

      setTitle(data.title || '')
      setBody(data.body || '')
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      alert('Please add a title and some content.')
      return
    }

    const { error } = await supabase
      .from('summaries')
      .update({ title, body })
      .eq('id', params.id)

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
      <h1 className="text-2xl font-semibold mb-4">Edit Candidate Summary</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full border rounded-xl p-3 outline-none"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Summary (email-ready)</label>
            <textarea
              className="w-full h-80 border rounded-xl p-3 outline-none"
              placeholder="Edit your summary..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="rounded-2xl px-5 py-2 border">Save</button>
            <button type="button" onClick={copyPreview} className="rounded-2xl px-5 py-2 border">Copy</button>
            <a href="/summaries" className="rounded-2xl px-5 py-2 border">Cancel</a>
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
