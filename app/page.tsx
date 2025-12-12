"use client";

import { useEffect, useState } from "react";

const PAID_KEY = "paid_v1";
const USAGE_KEY = "usage_v1";
const FREE_LIMIT = 1;

export default function HomePage() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const [isPaid, setIsPaid] = useState(false);
  const [usage, setUsage] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsPaid(localStorage.getItem(PAID_KEY) === "true");
    setUsage(Number(localStorage.getItem(USAGE_KEY) || 0));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true") {
      localStorage.setItem(PAID_KEY, "true");
      setIsPaid(true);
      window.history.replaceState({}, "", "/");
    }
  }, [hydrated]);

  async function handleGenerate() {
    if (!isPaid && usage >= FREE_LIMIT) {
      alert("Free resume used. Please upgrade to continue.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          jobDescription: jobDesc
        })
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      setOutput(data.text || "No response.");

      const nextUsage = usage + 1;
      setUsage(nextUsage);
      localStorage.setItem(USAGE_KEY, String(nextUsage));
    } catch {
      setOutput("Error generating tailored resume.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    const res = await fetch("/api/tailor/checkout", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  }

  if (!hydrated) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e5e7eb",
        padding: "48px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont"
      }}
    >
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 14,
          padding: 28
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          AI Resume Tailor
        </h1>

        <p style={{ color: "#9ca3af", marginBottom: 24 }}>
          Paste your resume and a job description. Get a tailored resume in seconds.
          <br />
          <strong>One free run. $9 unlocks unlimited use.</strong>
        </p>

        <label style={{ fontWeight: 600 }}>Current Resume</label>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 18,
            padding: 12,
            background: "#020617",
            color: "#e5e7eb",
            border: "1px solid #334155",
            borderRadius: 8
          }}
        />

        <label style={{ fontWeight: 600 }}>Job Description</label>
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 22,
            padding: 12,
            background: "#020617",
            color: "#e5e7eb",
            border: "1px solid #334155",
            borderRadius: 8
          }}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#1f2937",
            color: "#f9fafb",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          {loading ? "Generating..." : "Generate Tailored Resume"}
        </button>

        {!isPaid && usage >= FREE_LIMIT && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={handleUpgrade}
              style={{
                padding: "12px 20px",
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: 16,
                cursor: "pointer"
              }}
            >
              Unlock Unlimited Resumes ($9)
            </button>
          </div>
        )}

        {output && (
          <pre
            style={{
              marginTop: 32,
              padding: 20,
              background: "#020617",
              color: "#e5e7eb",
              borderRadius: 10,
              border: "1px solid #1e293b",
              whiteSpace: "pre-wrap",
              fontSize: 14,
              lineHeight: 1.5
            }}
          >
            {output}
          </pre>
        )}
      </section>
    </main>
  );
}
