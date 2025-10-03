"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

function AiTestInner() {
  const [prompt, setPrompt] = useState("Say hello in one sentence.");
  const [reply, setReply] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runTest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setReply("");
    try {
      const res = await fetch("/api/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setReply(json.reply);
    } catch (err: any) {
      setReply(`Error: ${err?.message ?? "Unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">AI Test</h1>
      <form onSubmit={runTest} className="space-y-3">
        <textarea
          className="w-full rounded-xl border p-3"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl border px-4 py-2"
        >
          {loading ? "Running..." : "Send to ChatGPT"}
        </button>
      </form>
      {reply && (
        <div className="rounded-xl border p-4 whitespace-pre-wrap">
          {reply}
        </div>
      )}
    </div>
  );
}

// Disable SSR for this page to avoid hydration mismatch
export default dynamic(() => Promise.resolve(AiTestInner), { ssr: false });
