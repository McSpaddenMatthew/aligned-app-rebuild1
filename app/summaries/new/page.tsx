// app/summaries/new/page.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";

type GenState = "idle" | "loading" | "error" | "done";
type SaveState = "idle" | "saving" | "error" | "saved";

export default function NewSummaryPage() {
  const [title, setTitle] = useState("");
  const [step1, setStep1] = useState(""); // HM call
  const [step2, setStep2] = useState(""); // Resume
  const [step3, setStep3] = useState(""); // Candidate call
  const [step4, setStep4] = useState(""); // JD
  const [step5, setStep5] = useState(""); // Optional intel

  const [body, setBody] = useState("");
  const [genState, setGenState] = useState<GenState>("idle");
  const [genError, setGenError] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Turn text into simple email-safe HTML for preview
  const emailHtml = useMemo(() => {
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const lines = body.split(/\r?\n/);
    let html = "";
    let inUl = false;
    let inOl = false;

    const flush = () => {
      if (inUl) {
        html += "</ul>";
        inUl = false;
      }
      if (inOl) {
        html += "</ol>";
        inOl = false;
      }
    };

    for (const raw of lines) {
      const line = raw.trimRight();
      if (!line.trim()) {
        flush();
        html += "<p>&nbsp;</p>";
        continue;
      }

      const ol = line.match(/^(\d+)[\.\)]\s+(.*)$/);
      if (ol) {
        if (!inOl) {
          flush();
          inOl = true;
          html += "<ol>";
        }
        html += `<li>${esc(ol[2])}</li>`;
        continue;
      }

      const ul = line.match(/^[-•]\s+(.*)$/);
      if (ul) {
        if (!inUl) {
          flush();
          inUl = true;
          html += "<ul>";
        }
        html += `<li>${esc(ul[1])}</li>`;
        continue;
      }

      if (/^#{1,6}\s+/.test(line)) {
        const txt = esc(line.replace(/^#{1,6}\s+/, ""));
        flush();
        html += `<p><strong>${txt}</strong></p>`;
        continue;
      }

      const bold = line.match(/^\*\*(.+)\*\*$/);
      if (bold) {
        flush();
        html += `<p><strong>${esc(bold[1])}</strong></p>`;
        continue;
      }

      flush();
      html += `<p>${esc(line)}</p>`;
    }

    flush();
    return html || "<p>&nbsp;</p>";
  }, [body]);

  async function generate() {
    setGenState("loading");
    setGenError(null);
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, step1, step2, step3, step4, step5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate summary.");
      setBody(data.text || data.summary || "");
      setGenState("done");
    } catch (e: any) {
      setGenError(e?.message || "Something went wrong.");
      setGenState("error");
    }
  }

  async function save() {
    setSaveState("saving");
    setSaveError(null);
    try {
      if (!title.trim()) {
        throw new Error("Add a title before saving.");
      }
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save summary.");
      setSaveState("saved"); // stay on page for MVP
    } catch (e: any) {
      setSaveError(e?.message || "Something went wrong.");
      setSaveState("error");
    }
  }

  async function generateAndSave() {
    await generate();
    if (genState !== "error") {
      await save();
    }
  }

  async function copyEmail() {
    try {
      const subject = title?.trim() || "Candidate Summary";
      const text = `${subject}\n\n${stripHtml(emailHtml)}`.trim();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header & helper */}
      <h1 className="text-2xl font-semibold text-[#0A0A0A]">Create Candidate Summary</h1>
      <p className="text-sm text-[#475569] mt-2">
        Paste your five inputs. Generate a manager-ready report. Save when you’re satisfied.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs & actions */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <ol className="list-decimal list-inside text-[#1E3A8A] space-y-1 text-sm mb-4">
            <li><strong>Hiring manager call notes</strong></li>
            <li><strong>Resume</strong></li>
            <li><strong>Candidate call notes</strong></li>
            <li><strong>Job description</strong></li>
            <li><strong>Optional company/org details</strong></li>
          </ol>

          <div className="space-y-3">
            <textarea
              placeholder="HM notes — goals, success criteria, must-haves, quotes…"
              value={step1}
              onChange={(e) => setStep1(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3"
            />
            <textarea
              placeholder="Resume highlights — roles, scope, outcomes, metrics…"
              value={step2}
              onChange={(e) => setStep2(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3"
            />
            <textarea
              placeholder="Candidate call — strengths, risks & mitigations, culture fit…"
              value={step3}
              onChange={(e) => setStep3(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3"
            />
            <textarea
              placeholder="JD — core responsibilities & requirements to map against…"
              value={step4}
              onChange={(e) => setStep4(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3"
            />
            <textarea
              placeholder="Optional intel — org structure, market notes, sensitive context…"
              value={step5}
              onChange={(e) => setStep5(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g., VP Data Strategy — Candidate Summary)"
              className="flex-1 rounded-xl border border-[#E5E7EB] px-4 py-3"
            />
            <button
              onClick={generate}
              disabled={genState === "loading"}
              className="rounded-xl bg-[#1E3A8A] text-white px-4 py-3 text-sm disabled:opacity-60"
            >
              {genState === "loading" ? "Generating…" : "Generate"}
            </button>
            <button
              onClick={generateAndSave}
              disabled={genState === "loading" || saveState === "saving"}
              className="rounded-xl border border-[#1E3A8A] text-[#1E3A8A] px-4 py-3 text-sm disabled:opacity-60"
            >
              {saveState === "saving" ? "Saving…" : "Generate & Save"}
            </button>
          </div>

          {genState === "error" && (
            <div className="mt-3 text-sm text-red-700">{genError}</div>
          )}
        </div>

        {/* Right: Preview & editable output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-medium text-[#475569]">EMAIL PREVIEW</h2>
              <div className="text-base font-semibold mt-1">
                {title?.trim() || "Draft summary"}
              </div>
            </div>
            <button
              onClick={copyEmail}
              className="rounded-lg bg-[#1E3A8A] text-white px-4 py-2 text-sm"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div
            ref={previewRef}
            className="rounded-2xl border border-[#E5E7EB] p-5 min-h-[280px] bg-white"
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />

          <label className="block text-sm font-medium mt-6 mb-2">
            Summary (edit before sending)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3"
          />

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saveState === "saving" || !title.trim()}
              className="rounded-xl bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
              title={!title.trim() ? "Add a title to enable saving" : ""}
            >
              {saveState === "saving" ? "Saving…" : "Save to Dashboard"}
            </button>

            {saveState === "saved" && (
              <span className="text-sm text-[#1E3A8A] flex gap-2 items-center">
                ✅ Saved.{" "}
                <Link href="/dashboard" className="underline hover:text-black">
                  View Dashboard →
                </Link>
              </span>
            )}
            {saveState === "error" && (
              <span className="text-sm text-red-700">{saveError}</span>
            )}
          </div>

          <p className="mt-6 text-xs text-[#94A3B8]">
            We don’t replace recruiters—we help you get more from the work they already do.
          </p>
        </div>
      </div>
    </main>
  );
}

/* Helper: strip HTML for copy */
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
