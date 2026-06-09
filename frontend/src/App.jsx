import { useState, useRef } from "react"
import axios from "axios"

const API = "https://voice-text2sql.onrender.com"

const s = {
  root: {
    minHeight: "100vh",
    background: "#0c0c0e",
    color: "#e8e8e8",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  topbar: {
    width: "100%",
    borderBottom: "1px solid #1c1c1f",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    boxSizing: "border-box",
    flexShrink: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "#fff",
    fontWeight: 600,
    flexShrink: 0,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#f0f0f0",
    letterSpacing: "-0.2px",
  },
  badge: {
    fontSize: 11,
    color: "#555",
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 20,
    padding: "2px 10px",
    letterSpacing: "0.3px",
  },
  main: {
    width: "100%",
    maxWidth: 720,
    padding: "48px 24px 80px",
    boxSizing: "border-box",
    flex: 1,
  },
  hero: {
    marginBottom: 36,
    textAlign: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 600,
    color: "#f5f5f5",
    letterSpacing: "-0.6px",
    margin: "0 0 8px",
    lineHeight: 1.2,
  },
  heroSub: {
    fontSize: 14,
    color: "#555",
    margin: 0,
    letterSpacing: "-0.1px",
  },
  queryCard: {
    background: "#111113",
    border: "1px solid #1e1e22",
    borderRadius: 14,
    padding: "14px 14px 12px",
    marginBottom: 16,
  },
  queryRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e8e8e8",
    fontSize: 15,
    padding: "4px 0",
    caretColor: "#3b82f6",
    letterSpacing: "-0.1px",
  },
  micBtn: (active, disabled) => ({
    width: 36,
    height: 36,
    borderRadius: 8,
    border: `1px solid ${active ? "#5c1c1c" : "#27272a"}`,
    background: active ? "#2a0a0a" : "transparent",
    color: active ? "#f87171" : "#555",
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s",
  }),
  askBtn: (disabled) => ({
    height: 36,
    padding: "0 18px",
    borderRadius: 8,
    border: "none",
    background: disabled ? "#1e2a3a" : "#3b82f6",
    color: disabled ? "#334155" : "#fff",
    fontSize: 13,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
    letterSpacing: "-0.1px",
    transition: "background 0.15s",
  }),
  divider: {
    height: "1px",
    background: "#1e1e22",
    margin: "10px -14px",
  },
  exampleRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    paddingTop: 2,
  },
  exampleChip: {
    fontSize: 12,
    color: "#555",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "3px 0",
    letterSpacing: "-0.1px",
    transition: "color 0.1s",
  },
  recordingBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    fontSize: 13,
    color: "#f87171",
    padding: "8px 12px",
    background: "#1a0808",
    border: "1px solid #3a1010",
    borderRadius: 8,
  },
  pulse: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#f87171",
    flexShrink: 0,
  },
  clarifyCard: {
    background: "#111108",
    border: "1px solid #2e2a00",
    borderRadius: 12,
    padding: "16px",
    marginBottom: 16,
  },
  clarifyQ: {
    fontSize: 14,
    color: "#d4b84a",
    marginBottom: 12,
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    lineHeight: 1.5,
  },
  clarifyInputRow: {
    display: "flex",
    gap: 8,
  },
  clarifyInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #2e2a00",
    background: "#0e0d00",
    color: "#e8e8e8",
    fontSize: 13,
    outline: "none",
  },
  clarifyBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    background: "#2a2200",
    border: "1px solid #3a3000",
    color: "#d4b84a",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  resultStack: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  panel: {
    background: "#111113",
    border: "1px solid #1e1e22",
    borderRadius: 12,
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid #1a1a1d",
  },
  panelLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "#444",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    flex: 1,
  },
  panelDot: (color) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),
  sqlBody: {
    padding: "12px 14px",
    overflowX: "auto",
  },
  sqlCode: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 13,
    color: "#4ec9b0",
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  textBody: {
    padding: "12px 14px",
    fontSize: 14,
    color: "#888",
    lineHeight: 1.7,
    margin: 0,
  },
  insightPanel: {
    background: "#0d111c",
    border: "1px solid #1a2236",
    borderLeft: "2px solid #3b82f6",
    borderRadius: "0 12px 12px 0",
    overflow: "hidden",
  },
  insightHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid #1a2236",
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "#3b82f6",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  insightBody: {
    padding: "12px 14px",
    fontSize: 14,
    color: "#7a9fc0",
    lineHeight: 1.7,
    margin: 0,
  },
  chartPanel: {
    background: "#111113",
    border: "1px solid #1e1e22",
    borderRadius: 12,
    overflow: "hidden",
  },
  chartImg: {
    width: "100%",
    display: "block",
  },
  tablePanel: {
    background: "#111113",
    border: "1px solid #1e1e22",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: "1px solid #1a1a1d",
  },
  tableRowCount: {
    fontSize: 11,
    color: "#333",
    background: "#1a1a1d",
    borderRadius: 20,
    padding: "2px 8px",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "8px 14px",
    background: "#0d0d10",
    color: "#3a3a40",
    fontWeight: 500,
    fontSize: 11,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom: "1px solid #1a1a1d",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "9px 14px",
    color: "#aaa",
    borderBottom: "1px solid #17171a",
    whiteSpace: "nowrap",
  },
  errorPanel: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "#150808",
    border: "1px solid #3a1010",
    borderRadius: 12,
    padding: "14px",
    fontSize: 14,
    color: "#f87171",
    lineHeight: 1.5,
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "20px 0",
    color: "#444",
    fontSize: 14,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "1.5px solid #222",
    borderTop: "1.5px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
}

const EXAMPLES = [
  "Show engineers in Bangalore",
  "Top 5 customers by revenue",
  "Orders placed last month",
  "Average salary by department",
]

export default function App() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [clarification, setClarification] = useState("")
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const submit = async (q, clarify = null) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post(`${API}/query-text`, {
        query: q,
        clarification: clarify || undefined,
      })
      setResult(res.data)
    } catch {
      setResult({ error: "Request failed. Please try again." })
    }
    setLoading(false)
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" })
      const formData = new FormData()
      formData.append("audio", blob, "recording.wav")
      setLoading(true)
      setResult(null)
      try {
        const res = await axios.post(`${API}/query-voice`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setResult(res.data)
        if (res.data.transcription) setQuery(res.data.transcription)
      } catch {
        setResult({ error: "Voice request failed. Please try again." })
      }
      setLoading(false)
      stream.getTracks().forEach((t) => t.stop())
    }
    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #333; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={s.topbar}>
        <div style={s.logo}>
          <div style={s.logoIcon}>V</div>
          <span style={s.logoText}>VoiceQuery</span>
        </div>
        <span style={s.badge}>beta</span>
      </div>

      <div style={s.main}>
        <div style={s.hero}>
          <h1 style={s.heroTitle}>Ask your database anything</h1>
          <p style={s.heroSub}>Type or speak — get SQL, results, and insights instantly.</p>
        </div>

        <div style={s.queryCard}>
          <div style={s.queryRow}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !loading && query.trim() && submit(query)
              }
              placeholder="e.g. show me engineers in Bangalore"
              style={s.input}
              autoFocus
            />
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
              style={s.micBtn(recording, loading)}
              title={recording ? "Stop" : "Record"}
            >
              {recording ? "⏹" : "🎤"}
            </button>
            <button
              onClick={() => submit(query)}
              disabled={loading || !query.trim()}
              style={s.askBtn(loading || !query.trim())}
            >
              {loading ? "..." : "Run query"}
            </button>
          </div>

          <div style={s.divider} />

          <div style={s.exampleRow}>
            <span style={{ fontSize: 12, color: "#2a2a2e", marginRight: 4, paddingTop: 3 }}>Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                style={s.exampleChip}
                onClick={() => {
                  setQuery(ex)
                  submit(ex)
                }}
                onMouseEnter={(e) => (e.target.style.color = "#888")}
                onMouseLeave={(e) => (e.target.style.color = "#555")}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {recording && (
          <div style={s.recordingBar}>
            <div style={{ ...s.pulse, animation: "pulse 1s ease-in-out infinite" }} />
            Recording — click ⏹ to stop and send
          </div>
        )}

        {loading && (
          <div style={s.loadingRow}>
            <div style={s.spinner} />
            Running query...
          </div>
        )}

        {result?.is_ambiguous && (
          <div style={s.clarifyCard}>
            <div style={s.clarifyQ}>
              <span>🤔</span>
              <span>{result.clarifying_question}</span>
            </div>
            <div style={s.clarifyInputRow}>
              <input
                value={clarification}
                onChange={(e) => setClarification(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && submit(query, clarification)
                }
                placeholder="Your answer..."
                style={s.clarifyInput}
              />
              <button
                onClick={() => submit(query, clarification)}
                style={s.clarifyBtn}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {result && !result.is_ambiguous && (
          <div style={s.resultStack}>
            {result.sql && (
              <div style={s.panel}>
                <div style={s.panelHeader}>
                  <div style={s.panelDot("#4ec9b0")} />
                  <span style={s.panelLabel}>Generated SQL</span>
                </div>
                <div style={s.sqlBody}>
                  <pre style={s.sqlCode}>{result.sql}</pre>
                </div>
              </div>
            )}

            {result.explanation && (
              <div style={s.panel}>
                <div style={s.panelHeader}>
                  <div style={s.panelDot("#555")} />
                  <span style={s.panelLabel}>Explanation</span>
                </div>
                <p style={s.textBody}>{result.explanation}</p>
              </div>
            )}

            {result.insights && (
              <div style={s.insightPanel}>
                <div style={s.insightHeader}>
                  <span style={s.insightLabel}>Insights</span>
                </div>
                <p style={s.insightBody}>{result.insights}</p>
              </div>
            )}

            {result.chart_url && (
              <div style={s.chartPanel}>
                <img
                  src={`${API}${result.chart_url}`}
                  alt="Query result chart"
                  style={s.chartImg}
                />
              </div>
            )}

            {result.results?.length > 0 && (
              <div style={s.tablePanel}>
                <div style={s.tableHeader}>
                  <div style={s.panelDot("#444")} />
                  <span style={{ ...s.panelLabel, flex: 1 }}>Results</span>
                  <span style={s.tableRowCount}>{result.results.length} rows</span>
                </div>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {Object.keys(result.results[0]).map((k) => (
                          <th key={k} style={s.th}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <td
                              key={j}
                              style={{
                                ...s.td,
                                borderBottom:
                                  i === result.results.length - 1
                                    ? "none"
                                    : "1px solid #17171a",
                              }}
                            >
                              {String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result.error && (
              <div style={s.errorPanel}>
                <span>⚠</span>
                <span>{result.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}