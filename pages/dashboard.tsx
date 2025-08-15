// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummaries() {
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setSummaries(data || []);
      }
      setLoading(false);
    }
    fetchSummaries();
  }, []);

  function getDisplayName(summary: any) {
    if (summary.candidate_name && summary.candidate_name.trim() !== '') {
      return summary.candidate_name;
    }

    if (summary.summary) {
      const firstLine = summary.summary.split('\n')[0];
      const match = firstLine.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
      return match ? match[0] : 'Unknown';
    }

    return 'Unknown';
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Candidate Summaries</h1>
        <Link
          href="/new-summary"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-blue-700 transition"
        >
          ➕ Start New Summary
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : summaries.length === 0 ? (
        <p className="text-gray-500">No summaries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {getDisplayName(summary)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(summary.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <Link
                      href={`/cases/${summary.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
