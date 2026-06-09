import { useState, useRef } from "react"
import axios from "axios"

const API = "https://voice-text2sql.onrender.com"

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
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Voice Text2SQL</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>Ask questions about your database in plain English</p>

      {/* Query input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit(query)}
          placeholder="e.g. show me all engineers in Bangalore"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 15 }}
        />
        {/* Mic button */}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          style={{
            padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 18,
            background: recording ? "#ff4444" : "#333",
            color: "#fff",
            transition: "background 0.2s"
          }}
          title={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? "⏹" : "🎤"}
        </button>
        <button
          onClick={() => submit(query)}
          disabled={loading || !query.trim()}
          style={{ padding: "10px 20px", borderRadius: 8, background: "#4f8ef7", color: "#fff", border: "none", cursor: "pointer", fontSize: 15 }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      {/* Recording indicator */}
      {recording && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#ff4444" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff4444", display: "inline-block", animation: "pulse 1s infinite" }} />
          Recording... click ⏹ to stop
        </div>
      )}

      {/* Clarification prompt */}
      {result?.is_ambiguous && (
        <div style={{ background: "#fffbeb", border: "1px solid #f6c90e", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 500 }}>🤔 {result.clarifying_question}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={clarification}
              onChange={e => setClarification(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit(query, clarification)}
              placeholder="Your answer..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
            />
            <button
              onClick={() => submit(query, clarification)}
              style={{ padding: "8px 16px", borderRadius: 8, background: "#f6c90e", border: "none", cursor: "pointer", fontSize: 14 }}
            >
              Clarify
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !result.is_ambiguous && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {result.sql && (
            <div style={{ background: "#1e1e1e", borderRadius: 8, padding: 16 }}>
              <p style={{ color: "#888", fontSize: 12, margin: "0 0 8px" }}>GENERATED SQL</p>
              <code style={{ color: "#4ec9b0", fontSize: 14 }}>{result.sql}</code>
            </div>
          )}
          {result.explanation && (
            <div style={{ background: "#f0f7ff", borderRadius: 8, padding: 16 }}>
              <p style={{ color: "#888", fontSize: 12, margin: "0 0 8px" }}>EXPLANATION</p>
              <p style={{ margin: 0, fontSize: 15 }}>{result.explanation}</p>
            </div>
          )}
          {result.insights && (
            <div style={{ background: "#f0fff4", border: "1px solid #86efac", borderRadius: 8, padding: 16 }}>
              <p style={{ color: "#166534", fontSize: 12, margin: "0 0 8px", fontWeight: 600 }}>💡 INSIGHTS</p>
              <p style={{ margin: 0, fontSize: 15, color: "#166534" }}>{result.insights}</p>
            </div>
          )}
          {result.chart_url && (
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
              <img src={`${API}${result.chart_url}`} alt="chart" style={{ width: "100%" }} />
            </div>
          )}
          {result.results?.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <p style={{ color: "#888", fontSize: 12, margin: "0 0 8px" }}>RAW RESULTS ({result.results.length} rows)</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    {Object.keys(result.results[0]).map(k => (
                      <th key={k} style={{ textAlign: "left", padding: "8px 12px", background: "#f5f5f5", borderBottom: "2px solid #eee" }}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      {Object.values(row).map((v, j) => (
                        <td key={j} style={{ padding: "8px 12px" }}>{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result.error && (
            <div style={{ background: "#fff0f0", borderRadius: 8, padding: 16, color: "#c00" }}>
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}