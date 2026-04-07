import { useState } from 'react';
import { Users, Wallet, Bus, LogOut, Info, CheckCircle } from 'lucide-react';
import './App.css';

type Role = 'NONE' | 'CEO' | 'DRIVER';
const BFF_URL = 'https://kalles-bff-625737625145.europe-west1.run.app';

function App() {
  const [role, setRole] = useState<Role>('NONE');
  const [view, setView] = useState('DASHBOARD'); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const formatTime = (dateStr: any) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const fetchData = async (selectedRole: Role) => {
    setLoading(true);
    try {
      const driverId = 'DRIVER-007';
      const endpoint = selectedRole === 'CEO' ? '/api/ceo/dashboard' : `/api/driver/schedule/${driverId}`;
      const response = await fetch(`${BFF_URL}${endpoint}`);
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error('API Error:', err);
      // Fallback
      setData(selectedRole === 'DRIVER' ? {
        shifts: [
          { 
            id: 'S-1', 
            planned_start_time: new Date().toISOString(), 
            planned_end_time: new Date(Date.now() + 28800000).toISOString(), 
            pickup_location: 'Norrtälje RC',
            line_id: '676',
            status: 'SCHEDULED'
          }
        ]
      } : {});
    } finally {
      setLoading(false);
    }
  };

  const login = (selectedRole: Role) => {
    setRole(selectedRole);
    fetchData(selectedRole);
  };

  if (role === 'NONE') {
    return (
      <div className="login-container">
        <div className="login-hero">
          <h1>Kalles Buss 🚌</h1>
          <p>Operativ Verksamhetsportal v1.5.3</p>
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
          <span className="badge">ID: DRIVER-007</span>
          <span className="badge">{role}</span>
          <button onClick={() => setRole('NONE')} className="icon-btn" title="Logga ut"><LogOut size={18} /></button>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : role === 'CEO' ? (
          <div className="dashboard">
            <section className="card">
              <h2><Wallet className="icon" /> Likviditet</h2>
              <div className="stat-value">{(data?.finance?.status?.totalLiquidity || 0).toLocaleString()} SEK</div>
            </section>
          </div>
        ) : (
          <div className="driver-app">
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
                      <div className="time">
                        {formatTime(data.shifts[0].planned_start_time)} - {formatTime(data.shifts[0].planned_end_time)}
                      </div>
                      <div className="details-list">
                        <div className="detail-item"><Info size={14}/> <strong>Linje:</strong> {data.shifts[0].line_id || '676'}</div>
                        <div className="detail-item"><Info size={14}/> <strong>Start:</strong> {data.shifts[0].pickup_location}</div>
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button 
                        className={`btn big ${checkedIn ? 'success' : 'primary'}`}
                        onClick={() => setCheckedIn(!checkedIn)}
                      >
                        {checkedIn ? <><CheckCircle size={20}/> Incheckad</> : 'Checka in på pass'}
                      </button>
                      <button className="btn danger outline">Sjukanmäl</button>
                    </div>
                  </>
                ) : <p>Inga pass planerade.</p>}
              </section>
            )}

            {view === 'CALENDAR' && (
              <section className="card">
                <h2>Schema</h2>
                <div className="list">
                  {data?.shifts?.map((s: any) => (
                    <div key={s.id} className="list-item">
                      <div className="date-box">
                        <span className="day">{new Date(s.planned_start_time).toLocaleDateString()}</span>
                        <span className="time-range">{formatTime(s.planned_start_time)} - {formatTime(s.planned_end_time)}</span>
                      </div>
                      <span className="status-badge">{s.status}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {view === 'VEHICLE' && (
              <section className="card">
                <h2>Fordon: BUSS-101</h2>
                <div className="bev-twin">
                  <div className="soc-container">
                    <div className="soc-bar" style={{width: '85%'}}></div>
                    <span className="soc-value">85% SoC</span>
                  </div>
                  <div className="v-details">
                    <p>Volvo 7900 Electric (145 km räckvidd)</p>
                  </div>
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
