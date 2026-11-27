import { useEffect, useState } from 'react';

async function request(path, options) {
  const response = await fetch(`/api/${path}`, { ...options, redirect: 'manual' });
  if (response.type === 'opaqueredirect' || response.status === 401) return null;
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Could not reach saved calculations.');
  return body;
}

export default function SavedCalculations({ inputs, onLoad }) {
  const [session, setSession] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function reload() {
    const data = await request('calculations');
    if (!data) {
      setSession(null);
      setCalculations([]);
      return;
    }
    setCalculations(data.calculations);
  }

  useEffect(() => {
    async function init() {
      try {
        const account = await request('session');
        if (account) {
          setSession(account);
          await reload();
        }
      } catch {
        setMessage('Could not load your saved calculations.');
      }
    }
    void init();
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const result = await request('calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, inputs })
      });
      if (!result) {
        setSession(null);
        setCalculations([]);
        setMessage('Your session expired. Sign in to save this calculation.');
        return;
      }
      setName('');
      await reload();
      setMessage('Calculation saved.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="results-container" aria-label="Saved calculations">
      <h3>Saved calculations</h3>
      {session ? (
        <>
          <p>Signed in as {session.email} · <a href="/cdn-cgi/access/logout">Sign out</a></p>
          {inputs && (
            <form onSubmit={save} className="pdf-group">
              <label htmlFor="calculation-name">Calculation name</label>
              <input id="calculation-name" value={name} onChange={event => setName(event.target.value)} required maxLength={100} />
              <button className="action-btn" disabled={saving || !name.trim()}>Save current calculation</button>
            </form>
          )}
          {calculations.length === 0 ? <p>No saved calculations yet.</p> : (
            <table className="saved-table">
              <thead><tr><th scope="col">Name</th><th scope="col">Total rise</th><th scope="col">Saved</th></tr></thead>
              <tbody>
                {calculations.map(calculation => (
                  <tr key={calculation.id}>
                    <td><button className="action-btn" onClick={() => onLoad(calculation)}>{calculation.name}</button></td>
                    <td>{calculation.totalRise}″</td>
                    <td>{new Date(calculation.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : <a href="/api/sign-in">Sign in to save and reopen calculations</a>}
      <p role="status">{message}</p>
    </section>
  );
}
