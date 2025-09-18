// app/summaries/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '../../lib/supabase-browser'

type Summary = {
  id: string
  title: string
  body: string
  created_at: string
  user_id: string
}

export default function SummariesPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [summaries, setSummaries] = useState<Summary[]>([])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setAuthed(true)

    const { data, error } = await supabase
      .from('summaries')
      .select('id,title,body,created_at,user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) setSummaries(data as Summary[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this summary?')) return
    const { error } = await supabase.from('summaries').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    // refresh list
    setSummaries((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading) return <div className="p-6">Loading summaries…</div>
  if (!authed) return null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your Candidate Summaries</h1>
        <a href="/summaries/new" className="rounded-2xl border px-4 py-2">New Summary</a>
      </div>

      {summaries.length === 0 ? (
        <p>No summaries yet. <a href="/summaries/new" className="underline">Create one</a>.</p>
      ) : (
        <ul className="space-y-4">
          {summaries.map((s) => (
            <li key={s.id} className="border rounded-xl p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium truncate">{s.title}</h2>
                    <span className="text-xs opacity-70">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap mt-2 text-sm">
                    {s.body.length > 300 ? s.body.slice(0, 300) + '…' : s.body}
                  </pre>
                </div>
                <div className="shrink-0 flex gap-2">
                  <a
                    href={`/summaries/${s.id}/edit`}
                    className="rounded-xl border px-3 py-1 text-sm"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-xl border px-3 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

