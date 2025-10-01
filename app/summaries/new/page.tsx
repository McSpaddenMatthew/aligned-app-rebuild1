// app/summaries/new/page.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";

type GenState = "idle" | "loading" | "error" | "done";

export default function NewSummaryPage() {
  const [title, setTitle] = useState("");
  const [step1, setStep1] = useState(""); // HM call
  const [step2, setStep2] = useState(""); // Resume
  const [step3, setStep3] = useState(""); // Candidate call
  const [step4, setStep4] = useState(""); // JD
  const [step5, setStep5] = useState(""); // Optional intel

  // Result (plain text you can edit before copying)
  const [body, setBody] = useState("");
  const [genState, setGenState] = useState<GenState>("idle");
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Render `body` into simple email-safe HTML for the preview
  const emailHtml = useMemo(() => {
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const lines = body.split(/\r?\n/);
    let html = "";
    let inUl = false;
    let inOl = false;

    const flush = () => {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (inOl) { html += "</ol>"; inOl = false; }
    };

    for (const raw of lines) {
      const line = raw.trimRight();
      if (!line.trim()) { flush(); html += "<p>&nbsp;</p>"; continue; }

      const ol = line.match(/^(\d+)[\.\)]\s+(.*)$/);
      if (ol) { if (!inOl) { flush(); inOl = true; html += "<ol>"; } html += `<li>${esc(ol[2])}</li>`; continue; }

      const ul = line.match(/^[-•]\s+(.*)$/);
      if (ul) { if (!inUl) { flush(); inUl = true; html += "<ul>"; } html += `<li>${esc(ul[1])}</li>`; continue; }

      if (/^#{1,6}\s+/.test(line)) {
        const txt = esc(line.replace(/^#{1,6}\s+/, ""));
        flush(); html += `<p><strong>${txt}</strong></p>`; continue;
      }

      // Markdown-style bold **Heading**
      const bold = line.match(/^\*\*(.+)\*\*$/);
      if (bold) { flush(); html += `<p><strong>${esc(bold[1])}</strong></p>`; continue; }

      flush(); html += `<p>${esc(line)}</p>`;
    }

    flush();
    return html || "<p>&nbsp;</p>";
  }, [body]);

  const copyEmail = async () => {
    try {
      const subject = title?.trim() || "Candidate Summary";
      const text = `${subject}\n\n${stripHtml(emailHtml)}`.trim();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const generate = async () => {
    setGenState("loading");
    setGenError(null);
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, step1, step2, step3, step4, step5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate.");

      // Put the AI result into the editor; preview auto-updates
      // `data.text` (or `data.summary` if you used the simpler backend)
      setBody(data.text || data.summary || "");
      setGenState("done");
    } catch (err: any) {
      setGenError(err?.message || "Something went wrong.");
      setGenState("error");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Create Candidate Summary</h1>
      <p className="text-sm text-gray-600 mt-2">
        Paste your sources, click <strong>Generate</strong>, then review the email-ready summary on the right. Click <strong>Copy</strong> to paste into Gmail/Outlook.
      </p>

      {/* Sources box */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-red-50 border-red-200 p-4">
          <div className="font-semibold text-red-800 mb-3">
            Sources to include (in this order)
          </div>
          <ol className="list-decimal list-inside text-red-900 space-y-1 text-sm mb-4">
            <li><strong>Step 1 — Hiring manager call notes / transcript</strong></li>
            <li><strong>Step 2 — Resume</strong></li>
            <li><strong>Step 3 — Candidate call transcript / notes</strong></li>
            <li><strong>Step 4 — Job Description</strong></li>
            <li><strong>Step 5 — Optional:</strong> job/company/org intel</li>
          </ol>

          <div className="space-y-3">
            <textarea
              placeholder="Step 1 — HM call notes…"
              value={step1}
              onChange={(e) => setStep1(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
            />
            <textarea
              placeholder="Step 2 — Resume highlights…"
              value={step2}
              onChange={(e) => setStep2(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
            />
            <textarea
              placeholder="Step 3 — Candidate call notes…"
              value={step3}
              onChange={(e) => setStep3(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
            />
            <textarea
              placeholder="Step 4 — Job description notes…"
              value={step4}
              onChange={(e) => setStep4(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
            />
            <textarea
              placeholder="Step 5 — Optional intel…"
              value={step5}
              onChange={(e) => setStep5(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., VP Data Strategy — Candidate Summary"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
            />
            <button
              onClick={generate}
              disabled={genState === "loading"}
              className="rounded-xl bg-black text-white px-4 py-3 text-sm disabled:opacity-60"
            >
              {genState === "loading" ? "Generating…" : "Generate"}
            </button>
          </div>
          {genState === "error" && (
            <div className="mt-3 text-sm text-red-700">{genError}</div>
          )}
        </div>

        {/* Right side: Email preview + editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-medium text-gray-700">EMAIL PREVIEW</h2>
              <div className="text-base font-semibold mt-1">
                {title?.trim() || "Untitled Summary"}
              </div>
            </div>
            <button
              onClick={copyEmail}
              className="rounded-lg bg-black text-white px-4 py-2 text-sm"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div
            ref={previewRef}
            className="rounded-2xl border p-5 min-h-[280px] bg-white"
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />

          <label className="block text-sm font-medium mt-6 mb-2">
            Summary (you can edit before copying)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>
      </div>
    </main>
  );
}

/* ---------------- helpers ---------------- */

function stripHtml(html: string) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  tmp.querySelectorAll("ol, ul").forEach((list) => {
    const isOl = list.tagName.toLowerCase() === "ol";
    const items = Array.from(list.querySelectorAll("li"));
    const lines = items.map((li, i) =>
      `${isOl ? `${i + 1})` : "-"} ${li.textContent?.trim() || ""}`
    );
    const p = document.createElement("p");
    p.textContent = lines.join("\n");
    list.replaceWith(p);
  });

  return (tmp.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

