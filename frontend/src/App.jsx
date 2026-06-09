import { useState, useRef } from "react"
import axios from "axios"

const API = "https://voice-text2sql.onrender.com"

const styles = {
  app: { maxWidth: 800, margin: "0 auto", padding: "24px 20px", fontFamily: "system-ui, sans-serif" },
  header: { marginBottom: 28, borderBottom: "0.5px solid #2a2a2a", paddingBottom: 20 },
  h1: { fontSize: 20, fontWeight: 500, color: "#f0f0f0", letterSpacing: "-0.3px", margin: 0 },
  subtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  inputRow: { display: "flex", gap: 8, marginBottom: 20 },
  input: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "0.5px solid #2e2e2e", background: "#1a1a1a", color: "#f0f0f0", fontSize: 14, outline: "none" },
  btnMic: (recording) => ({ padding: "10px 14px", borderRadius: 8, border: "0.5px solid #2e2e2e", background: recording ? "#3a1a1a" : "#1a1a1a", color: recording ? "#ff6b6b" : "#888", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }),
  btnAsk: (disabled) => ({ padding: "10px 20px", borderRadius: 8, border: "none", background: disabled ? "#2a3a5a" : "#4f8ef7", color: disabled ? "#555" : "#fff", fontSize: 14, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer" }),
  recordingIndicator: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13, color: "#ff6b6b" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#ff6b6b" },
  section: { borderRadius: 10, border: "0.5px solid #2a2a2a", marginBottom: 10, overflow: "hidden" },
  sectionLabel: { fontSize: 11, letterSpacing: "0.6px", fontWeight: 500, padding: "10px 14px 0", color: "#555", textTransform: "uppercase" },
  sqlBlock: { background: "#141414", padding: "10px 14px 14px" },
  sqlCode: { fontFamily: "monospace", fontSize: 13, color: "#4ec9b0", lineHeight: 1.6, display: "block", marginTop: 8 },
  explainBlock: { background: "#161616", padding: "10px 14px 14px" },
  explainText: { fontSize: 14, color: "#aaa", lineHeight: 1.7, marginTop: 8 },
  insightSection: { borderRadius: 10, border: "0.5px solid #2a2a2a", borderLeft: "3px solid #4f8ef7", marginBottom: 10, overflow: "hidden", background: "#161620" },
  insightLabel: { fontSize: 11, letterSpacing: "0.6px", fontWeight: 500, color: "#4f8ef7", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, padding: "10px 14px 0" },
  insightText: { fontSize: 14, color: "#aaa", lineHeight: 1.7, padding: "8px 14px 14px" },
  chartSection: { borderRadius: 10, border: "0.5px solid #2a2a2a", marginBottom: 10, overflow: "hidden" },
  tableSection: { borderRadius: 10, border: "0.5px solid #2a2a2a", marginBottom: 10, overflow: "hidden" },
  tableLabel: { fontSize: 11, letterSpacing: "0.6px", fontWeight: 500, padding: "10px 14px 8px", color: "#555", textTransform: "uppercase" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 14px", background: "#141414", color: "#555", fontWeight: 500, fontSize: 11, letterSpacing: "0.4px", textTransform: "uppercase", borderBottom: "0.5px solid #2a2a2a" },
  td: { padding: "9px 14px", color: "#ccc", borderBottom: "0.5px solid #1e1e1e" },
  clarifyBox: { background: "#1a1800", border: "0.5px solid #3a3000", borderRadius: 10, padding: 16, marginBottom: 20 },
  clarifyQ: { fontSize: 14, fontWeight: 500, color: "#e0c060", marginBottom: 12 },
  clarifyRow: { display: "flex", gap: 8 },
  clarifyInput: { flex: 1, padding: "8px 12px", borderRadius: 8, border: "0.5px solid #3a3000", background: "#141400", color: "#f0f0f0", fontSize: 14, outline: "none" },
  btnClarify: { padding: "8px 16px", borderRadius: 8, background: "#4a3800", border: "0.5px solid #6a5000", color: "#e0c060", cursor: "pointer", fontSize: 14 },
  errorBox: { background: "#1a0a0a", borderRadius: 10, padding: 16, color: "#ff6b6b", fontSize: 14 },
}

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
        clarification: clarify || undefined
      })
      setResult(res.data)
    } catch (e) {
      setResult({ error: "Request failed" })
    }
    setLoading(false)
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []
    mediaRecorder.ondataavailable = e => chunksRef.current.push(e.data)
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" })
      const formData = new FormData()
      formData.append("audio", blob, "recording.wav")
      setLoading(true)
      setResult(null)
      try {
        const res = await axios.post(`${API}/query-voice`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        setResult(res.data)
        if (res.data.transcription) setQuery(res.data.transcription)
      } catch (e) {
        setResult({ error: "Voice request failed" })
      }
      setLoading(false)
      stream.getTracks().forEach(t => t.stop())
    }
    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.h1}>VoiceQuery</h1>
        <p style={styles.subtitle}>Natural Language Analytics for Your Database</p>
      </div>

      <div style={styles.inputRow}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && query.trim() && submit(query)}
          placeholder="e.g. show me engineers in Bangalore"
          style={styles.input}
        />
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          style={styles.btnMic(recording)}
          title={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? "⏹" : "🎤"}
        </button>
        <button
          onClick={() => submit(query)}
          disabled={loading || !query.trim()}
          style={styles.btnAsk(loading || !query.trim())}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      {recording && (
        <div style={styles.recordingIndicator}>
          <span style={styles.dot} />
          Recording... click ⏹ to stop
        </div>
      )}

      {result?.is_ambiguous && (
        <div style={styles.clarifyBox}>
          <p style={styles.clarifyQ}>🤔 {result.clarifying_question}</p>
          <div style={styles.clarifyRow}>
            <input
              value={clarification}
              onChange={e => setClarification(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit(query, clarification)}
              placeholder="Your answer..."
              style={styles.clarifyInput}
            />
            <button onClick={() => submit(query, clarification)} style={styles.btnClarify}>
              Clarify
            </button>
          </div>
        </div>
      )}

      {result && !result.is_ambiguous && (
        <div>
          {result.sql && (
            <div style={styles.section}>
              <div style={styles.sqlBlock}>
                <div style={styles.sectionLabel}>Generated SQL</div>
                <code style={styles.sqlCode}>{result.sql}</code>
              </div>
            </div>
          )}

          {result.explanation && (
            <div style={styles.section}>
              <div style={styles.explainBlock}>
                <div style={styles.sectionLabel}>Explanation</div>
                <p style={styles.explainText}>{result.explanation}</p>
              </div>
            </div>
          )}

          {result.insights && (
            <div style={styles.insightSection}>
              <div style={styles.insightLabel}>💡 Insights</div>
              <p style={styles.insightText}>{result.insights}</p>
            </div>
          )}

          {result.chart_url && (
            <div style={styles.chartSection}>
              <img src={`${API}${result.chart_url}`} alt="chart" style={{ width: "100%", display: "block" }} />
            </div>
          )}

          {result.results?.length > 0 && (
            <div style={styles.tableSection}>
              <div style={styles.tableLabel}>
                Raw Results <span style={{ color: "#444", fontWeight: 400 }}>({result.results.length} rows)</span>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(result.results[0]).map(k => (
                      <th key={k} style={styles.th}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((v, j) => (
                        <td key={j} style={{ ...styles.td, borderBottom: i === result.results.length - 1 ? "none" : "0.5px solid #1e1e1e" }}>
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.error && (
            <div style={styles.errorBox}>{result.error}</div>
          )}
        </div>
      )}
    </div>
  )
}