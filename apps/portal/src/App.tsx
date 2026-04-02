import { useState, useEffect } from 'react';
import { Users, Wallet, Bus, AlertCircle, LogOut, Calendar, Info, CheckCircle, Clock } from 'lucide-react';
import './App.css';

type Role = 'NONE' | 'CEO' | 'DRIVER';
const BFF_URL = 'https://kalles-bff-w7fsmra4yq-ew.a.run.app';

function App() {
  const [role, setRole] = useState<Role>('NONE');
  const [view, setView] = useState('DASHBOARD'); // Dashboard, Calendar, Vehicle, Leave
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const driverId = 'FÖRARE-007'; // Lab-standard

  const fetchData = async (selectedRole: Role) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = selectedRole === 'CEO' ? '/api/ceo/dashboard' : `/api/driver/schedule/${driverId}`;
      const response = await fetch(`${BFF_URL}${endpoint}`);
      if (!response.ok) throw new Error('Kunde inte nå domäntjänsterna');
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
      // Fallback för demo
      setData(selectedRole === 'CEO' ? {
        finance: { status: { totalLiquidity: 0 }, forecast: { projectedLiquidity: 0 } },
        companyName: 'Kalles Buss AB (Demo Mode)'
      } : { shifts: [] });
    } finally {
      setLoading(false);
    }
  };

  const login = (selectedRole: Role) => {
    setRole(selectedRole);
    fetchData(selectedRole);
  };

  const reportSick = async () => {
    if (!window.confirm('Vill du verkligen anmäla sjukdom? Dina pass för idag kommer att avbokas.')) return;
    setLoading(true);
    try {
      // I en labbmiljö pratar vi ibland direkt med domänen för simulator-triggers
      await fetch('https://kalles-hr-w7fsmra4yq-ew.a.run.app/simulate/sick-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId })
      });
      alert('Sjukanmälan registrerad och trafikledningen är meddelad.');
      fetchData('DRIVER');
    } catch (err) {
      alert('Kunde inte registrera sjukdom just nu.');
    } finally {
      setLoading(false);
    }
  };

  if (role === 'NONE') {
    return (
      <div className="login-container">
        <div className="login-hero">
          <h1>Kalles Buss 🚌</h1>
          <p>Operativ Verksamhetsportal v1.5</p>
        </div>
        <div className="role-grid">
          <button onClick={() => login('CEO')} className="role-card">
            <Users size={48} />
            <span>VD / Ledning</span>
          </button>
          <button onClick={() => login('DRIVER')} className="role-card">
            <Bus size={48} />
            <span>Förare</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-layout">
      <header>
        <div className="logo" onClick={() => setView('DASHBOARD')}>Kalles Buss 🚌</div>
        <div className="user-info">
          <span className="badge">{role === 'CEO' ? 'CEO' : 'Driver'}</span>
          <button onClick={() => setRole('NONE')} className="icon-btn"><LogOut size={18} /></button>
        </div>
      </header>

      <main>
        {error && <div className="error-banner"><AlertCircle size={16}/> {error}</div>}
        
        {loading ? (
          <div className="loader">
            <div className="spinner"></div>
            <p>Hämtar data från molnet...</p>
          </div>
        ) : role === 'CEO' ? (
          <div className="dashboard">
            <section className="card stats">
              <h2><Wallet className="icon" /> Finansiell Status</h2>
              <div className="stat-grid">
                <div className="stat">
                  <label>Aktuell Likviditet</label>
                  <span className="value">{(data?.finance?.status?.totalLiquidity || 0).toLocaleString()} SEK</span>
                </div>
                <div className="stat">
                  <label>Prognos (30d)</label>
                  <span className="value highlight">{(data?.finance?.forecast?.projectedLiquidity || 0).toLocaleString()} SEK</span>
                </div>
              </div>
            </section>

            <section className="card map-preview">
              <h2><Bus className="icon" /> Fleet Management</h2>
              <div className="map-placeholder">
                <div className="bus-marker active" style={{top: '30%', left: '40%'}}>676</div>
                <div className="bus-marker" style={{top: '60%', left: '70%'}}>676</div>
                <p>Visar fordon i drift på linje 676</p>
              </div>
              <div className="stat-footer">
                <div className="pill"><CheckCircle size={12}/> 12 Fordon Online</div>
                <div className="pill warning"><Clock size={12}/> 2 Avvikelser</div>
              </div>
            </section>
          </div>
        ) : (
          <div className="driver-app">
            {/* Navigering för förare */}
            <nav className="sub-nav">
              <button className={view === 'DASHBOARD' ? 'active' : ''} onClick={() => setView('DASHBOARD')}>IDAG</button>
              <button className={view === 'CALENDAR' ? 'active' : ''} onClick={() => setView('CALENDAR')}>SCHEMA</button>
              <button className={view === 'VEHICLE' ? 'active' : ''} onClick={() => setView('VEHICLE')}>FORDON</button>
            </nav>

            {view === 'DASHBOARD' && (
              <section className="card shift-card main-focus">
                <label className="section-label">Dagens pass</label>
                {data?.shifts?.length > 0 ? (
                  <>
                    <div className="shift-info">
                      <div className="time">{new Date(data.shifts[0].planned_start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(data.shifts[0].planned_end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="location"><Info size={14}/> Start: {data.shifts[0].pickup_location || 'Norrtälje RC'}</div>
                    </div>
                    <div className="action-buttons">
                      <button className="btn primary big">Checka in på pass</button>
                      <button onClick={reportSick} className="btn danger outline">Sjukanmäl</button>
                    </div>
                  </>
                ) : (
                  <p className="empty-msg">Inga planerade pass för idag.</p>
                )}
              </section>
            )}

            {view === 'CALENDAR' && (
              <section className="card calendar-list">
                <h2><Calendar className="icon" /> Kommande pass</h2>
                <div className="list">
                  {data?.shifts?.map((s: any) => (
                    <div key={s.id} className={`list-item ${s.status}`}>
                      <div className="date">{new Date(s.planned_start_time).toLocaleDateString()}</div>
                      <div className="time">{new Date(s.planned_start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="status-dot"></div>
                    </div>
                  ))}
                </div>
                <button className="btn secondary full-width mt-20">Ansök om ledighet</button>
              </section>
            )}

            {view === 'VEHICLE' && (
              <section className="card vehicle-details">
                <h2><Info className="icon" /> Tilldelat Fordon</h2>
                <div className="bev-twin">
                  <div className="vehicle-header">
                    <span className="v-id">BUSS-101</span>
                    <span className="v-model">Volvo 7900 Electric</span>
                  </div>
                  <div className="soc-container">
                    <div className="soc-bar" style={{width: '85%'}}></div>
                    <span className="soc-value">85% SoC</span>
                  </div>
                  <div className="v-stats">
                    <div className="v-stat">
                      <label>Kapacitet</label>
                      <span>55 pers</span>
                    </div>
                    <div className="v-stat">
                      <label>Typ</label>
                      <span>Urban BEV</span>
                    </div>
                  </div>
                </div>
                <div className="alert-box info">
                  <AlertCircle size={16} />
                  <p>Beräknad räckvidd (vinter): 145 km. Räcker för hela passet.</p>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
