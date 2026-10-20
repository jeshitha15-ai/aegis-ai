
import { useState } from 'react';

type Report = {
  id: number;
  summary: string;
  likely_cause: string;
  confidence: string;
  recommended_steps: string[];
  evidence: { source: string; detail: string }[];
  tool_trace: {
    round: number;
    tool: string;
    arguments: unknown;
    result: unknown;
  }[];
  limitations: string[];
};

type HistoryItem = {
  id: number;
  description: string;
  created_at: string;
};

type Page = 'investigation' | 'history' | 'knowledge';

export default function App() {
  const [description, setDescription] = useState(
    'My orders-api started returning database connection errors after the latest deployment.'
  );
  const [logs, setLogs] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState<Page>('investigation');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState('');
  // Start a new AI investigation
  
async function run() {
  setLoading(true);
  setError('');
  setReport(null);

  try {
    const response = await fetch('/api/investigate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description, logs }),
    });

    // Read the response as text first
    const responseText = await response.text();

    // Check whether the backend returned an empty response
    if (!responseText.trim()) {
      throw new Error(
        `Backend returned an empty response (HTTP ${response.status})`
      );
    }

    // Convert the response text into JSON
    let data: Report & { detail?: string; error?: string };

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Invalid JSON response (HTTP ${response.status}): ${responseText.slice(0, 200)}`
      );
    }

    // Check whether the request succeeded
    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          `Investigation failed (HTTP ${response.status})`
      );
    }

    // Display the investigation report
    setReport(data);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Could not connect to backend'
    );
  } finally {
    setLoading(false);
  }
}


  // Load saved investigations from the backend
  async function loadHistory() {
    setPage('history');
    setHistoryLoading(true);
    setError('');

    try {
      const response = await fetch('/api/investigations');

      if (!response.ok) {
        throw new Error('Unable to load investigation history');
      }

      const data: HistoryItem[] = await response.json();
      setHistory(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'History loading failed'
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  // Return to the investigation page
  function openInvestigation() {
    setPage('investigation');
    setError('');
  }
  // Open a saved investigation report
async function openSavedInvestigation(id: number) {
  setError('');
  setLoading(true);
  setReport(null);

  try {
    const response = await fetch(`/api/investigations/${id}`);

    if (!response.ok) {
      throw new Error('Unable to open investigation');
    }

    const data: Report = await response.json();

    setReport(data);
    setPage('investigation');
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to load investigation'
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside>
        <div className="logo">
          ⬡
          <span>
            AEGIS AI
            <small>INCIDENT INTELLIGENCE</small>
          </span>
        </div>

        <p className="label">WORKSPACE</p>

        <div
          className={`nav ${
            page === 'investigation' ? 'active' : ''
          }`}
          onClick={openInvestigation}
          style={{ cursor: 'pointer' }}
        >
          ◈ &nbsp; Investigation
        </div>

        <div
          className={`nav ${
            page === 'history' ? 'active' : ''
          }`}
          onClick={loadHistory}
          style={{ cursor: 'pointer' }}
        >
          ◷ &nbsp; Investigation history
        </div>

        <div
          className={`nav ${page === 'knowledge' ? 'active' : ''}`}
          onClick={() => {
          setPage('knowledge');
          setError('');
          }}
          style={{ cursor: 'pointer' }}
        >
           ▤ &nbsp; Knowledge base
        </div>

        <div className="sidefoot">
          ● Demo environment online
          <small>Synthetic diagnostic data only</small>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main>
        <header>
          <div>
            <p className="label">
              AGENT WORKSPACE / OVERVIEW
            </p>

            <h1>
              {page === 'investigation'
              ? 'Incident investigation'
              : page === 'history'
              ? 'Investigation history'
              : 'Knowledge base'}
            </h1>

            <p className="sub">
              {page === 'investigation'
              ? 'Investigate technical failures with tools, evidence, and AI reasoning.'
              : page === 'history'
              ? 'View previous AI investigations and incident records.'
              : 'Explore common technical problems and their solutions.'}
            </p>
          </div>

          <span className="ready">
            ● SYSTEM READY
          </span>
        </header>

        {/* INFORMATION CARDS */}
        <section className="stats">
          <div>
            <small>AGENT MODE</small>
            <b>Tool-using LLM</b>
            <span>Multi-step investigation</span>
          </div>

          <div>
            <small>DIAGNOSTIC TOOLS</small>
            <b>4 available</b>
            <span>Read-only demo tools</span>
          </div>

          <div>
            <small>SAFETY MODE</small>
            <b>Recommendations only</b>
            <span>No system changes</span>
          </div>
        </section>
{/* KNOWLEDGE BASE PAGE */}
{page === 'knowledge' && (
  <section className="panel">
    <p className="label">AEGIS AI KNOWLEDGE CENTER</p>
    <h2>Knowledge Base</h2>
<input
  type="text"
  placeholder="Search problems, errors, or solutions..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    marginTop: '12px',
    borderRadius: '8px',
    background: '#111827',
    color: 'white',
    border: '1px solid #374151',
  }}
/>
    <p>
      Common technical incidents and recommended solutions.
    </p>

    {['database', 'postgresql', 'connection', 'timeout', 'hostname', 'port']
  .some((word) =>
    word.includes(search.trim().toLowerCase()) ||
    search.trim().toLowerCase().includes(word)
  ) && (<div className="evidence">
      <h3>1. Database Connection Timeout</h3>
      <p>
        <b>Problem:</b> Application cannot connect
        to PostgreSQL.
      </p>
      <p>
        <b>Cause:</b> Incorrect database configuration
        or unavailable server.
      </p>
      <p>
        <b>Solution:</b> Verify database hostname,
        port, credentials, and server health.
      </p>
    </div>
  )}

    {['cpu', 'high', 'usage', 'performance', 'slow', 'processing']
  .some((word) =>
    word.includes(search.trim().toLowerCase()) ||
    search.trim().toLowerCase().includes(word)
  ) && (<div className="evidence">
      <h3>2. High CPU Usage</h3>
      <p>
        <b>Problem:</b> Application becomes slow.
      </p>
      <p>
        <b>Cause:</b> Expensive queries or
        resource-intensive processes.
      </p>
      <p>
        <b>Solution:</b> Review CPU metrics,
        application logs, and slow queries.
      </p>
    </div>
    )}

    {['api', 'service', 'unavailable', '503', 'server', 'dependency']
  .some((word) =>
    word.includes(search.trim().toLowerCase()) ||
    search.trim().toLowerCase().includes(word)
  ) && (<div className="evidence">
      <h3>3. API Service Unavailable</h3>
      <p>
        <b>Problem:</b> API returns HTTP 503 errors.
      </p>
      <p>
        <b>Cause:</b> Service crashes or
        unavailable dependencies.
      </p>
      <p>
        <b>Solution:</b> Check API health,
        logs, and service dependencies.
      </p>
    </div>
    )}

    {['memory', 'spike', 'leak', 'caching', 'logs']
  .some((word) =>
    word.includes(search.trim().toLowerCase()) ||
    search.trim().toLowerCase().includes(word)
  ) && (<div className="evidence">
      <h3>4. Memory Usage Spike</h3>
      <p>
        <b>Problem:</b> Application memory usage
        increases unexpectedly.
      </p>
      <p>
        <b>Cause:</b> Memory leaks or excessive caching.
      </p>
      <p>
        <b>Solution:</b> Inspect memory metrics,
        logs, and recent code changes.
      </p>
    </div>
    )}
  </section>
)}
        {/* INVESTIGATION HISTORY PAGE */}
        {page === 'history' && (
          <section className="panel">
            <p className="label">SAVED INVESTIGATIONS</p>
            <h2>Investigation History</h2>

            {historyLoading && (
              <p>Loading investigations...</p>
            )}

            {!historyLoading && error && (
              <div className="error">{error}</div>
            )}

            {!historyLoading &&
              !error &&
              history.length === 0 && (
                <p>No investigations found.</p>
              )}

            {!historyLoading &&
  history.map((item) => (
    <div
      className="evidence"
      key={item.id}
      onClick={() => openSavedInvestigation(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSavedInvestigation(item.id);
        }
      }}
      style={{
        cursor: 'pointer',
        marginBottom: '12px',
      }}
    >
      <h3>
        Investigation #{item.id} →
      </h3>

      <p>{item.description}</p>

      <small>
        Created: {item.created_at}
      </small>
    </div>
  ))}
          </section>
        )}

        {/* NEW INVESTIGATION PAGE */}
        {page === 'investigation' && (
          <div className="columns">
            {/* INPUT PANEL */}
            <section className="panel">
              <p className="label">
                NEW INVESTIGATION
              </p>

              <h2>Describe the incident</h2>

              <label>Incident description</label>

              <textarea
                rows={5}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <label>
                Additional logs <small>OPTIONAL</small>
              </label>

              <textarea
                rows={4}
                value={logs}
                onChange={(e) =>
                  setLogs(e.target.value)
                }
                placeholder="Paste sanitized logs here. Never include passwords or secrets."
              />

              <div className="notice">
                ⚠ Use synthetic or sanitized data.
                Aegis recommends actions but never
                executes fixes.
              </div>

              <button
                onClick={run}
                disabled={
                  loading ||
                  description.trim().length < 8
                }
              >
                {loading
                  ? '◌ Investigating…'
                  : '⬡ Start investigation →'}
              </button>

              {error && (
                <div className="error">
                  {error}
                </div>
              )}

              <hr />

              <p className="label">
                INVESTIGATION FLOW
              </p>

              <p>01 &nbsp; Understand incident</p>
              <p>02 &nbsp; Call diagnostic tools</p>
              <p>03 &nbsp; Correlate evidence</p>
              <p>04 &nbsp; Generate report</p>
            </section>

            {/* RESULTS PANEL */}
            <section className="panel results">
              <p className="label">
                INVESTIGATION OUTPUT
              </p>

              <h2>Findings & evidence</h2>

              {!report && !loading && (
                <div className="empty">
                  <div>⌕</div>
                  <h3>Ready to investigate</h3>
                  <p>
                    Submit an incident to see tool calls,
                    findings, evidence, and recommended
                    next steps.
                  </p>
                </div>
              )}

              {loading && (
                <div className="empty">
                  <h3>Investigating incident…</h3>
                  <p>
                    The agent is selecting tools and
                    reviewing results. This can take
                    a little time.
                  </p>
                </div>
              )}

              {report && (
                <>
                  <p className="id">
                    INVESTIGATION #{report.id}
                  </p>

                  <div className="cause">
                    <small>
                      LIKELY ROOT CAUSE ·{' '}
                      {report.confidence.toUpperCase()}{' '}
                      CONFIDENCE
                    </small>

                    <h3>{report.likely_cause}</h3>
                    <p>{report.summary}</p>
                  </div>

                  <h3>
                    ✓ Recommended next steps
                  </h3>

                  <ol>
                    {report.recommended_steps.map(
                      (step, index) => (
                        <li key={index}>
                          {step}
                        </li>
                      )
                    )}
                  </ol>

                  <h3>
                    ⌕ Evidence ({report.evidence.length})
                  </h3>

                  {report.evidence.map(
                    (item, index) => (
                      <div
                        className="evidence"
                        key={index}
                      >
                        <b>{item.source}</b>
                        <p>{item.detail}</p>
                      </div>
                    )
                  )}

                  <h3>
                    ⚙ Tool-call trace (
                    {report.tool_trace.length})
                  </h3>

                  {report.tool_trace.map(
                    (tool, index) => (
                      <details key={index}>
                        <summary>
                          {index + 1}. {tool.tool}
                          {' — '}round {tool.round}
                        </summary>

                        <pre>
                          {JSON.stringify(
                            {
                              arguments: tool.arguments,
                              result: tool.result,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </details>
                    )
                  )}

                  {report.limitations.length > 0 && (
                    <div className="notice">
                      Limitations:{' '}
                      {report.limitations.join(' · ')}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        <footer>
          AEGIS AI · LEARNING PROTOTYPE
          <span>
            Evidence first. Human approval always.
          </span>
        </footer>
      </main>
    </div>
  );
}
