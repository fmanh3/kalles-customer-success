import React, { useState, useEffect } from 'react';
import { Layout, Users, Wallet, Bus, AlertCircle, LogOut } from 'lucide-react';
import './App.css';

type Role = 'NONE' | 'CEO' | 'DRIVER';

function App() {
  const [role, setRole] = useState<Role>('NONE');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Lab-login simulering
  const login = (selectedRole: Role) => {
    setRole(selectedRole);
    setLoading(true);
    // I en riktig app skulle vi anropa BFF här
    setTimeout(() => {
      if (selectedRole === 'CEO') {
        setData({
          liquidity: { status: { totalLiquidity: 654300 }, forecast: { projectedLiquidity: 820000 } },
          fleet: { activeBuses: 12, onTime: '92%' }
        });
      } else {
        setData({
          name: 'Stina Svensson',
          id: 'FÖRARE-008',
          nextShift: { start: '08:00', end: '16:00', line: '676', vehicle: 'BUSS-101' }
        });
      }
      setLoading(false);
    }, 800);
  };

  if (role === 'NONE') {
    return (
      <div className="login-container">
        <h1>Kalles Buss Portal</h1>
        <p>Välj din profil för att logga in i labbmiljön</p>
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
        <div className="logo">Kalles Buss 🚌</div>
        <div className="user-info">
          <span>{role === 'CEO' ? 'VD-Dashboard' : `Förare: ${data?.name}`}</span>
          <button onClick={() => setRole('NONE')} className="icon-btn"><LogOut size={20} /></button>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loader">Hämtar realtidsdata från domänerna...</div>
        ) : role === 'CEO' ? (
          <div className="dashboard">
            <section className="card stats">
              <h2><Wallet className="icon" /> Finansiell Status</h2>
              <div className="stat-grid">
                <div className="stat">
                  <label>Total Likviditet</label>
                  <span className="value">{data?.liquidity.status.totalLiquidity.toLocaleString()} SEK</span>
                </div>
                <div className="stat">
                  <label>Prognos (30d)</label>
                  <span className="value highlight">{data?.liquidity.forecast.projectedLiquidity.toLocaleString()} SEK</span>
                </div>
              </div>
            </section>

            <section className="card map-preview">
              <h2><Bus className="icon" /> Fleet Map</h2>
              <div className="map-placeholder">
                <div className="bus-marker" style={{top: '40%', left: '60%'}}>676</div>
                <p>Visar {data?.fleet.activeBuses} fordon i drift</p>
              </div>
              <div className="stat-footer">Punktlighet: {data?.fleet.onTime}</div>
            </section>
          </div>
        ) : (
          <div className="driver-app">
            <section className="card shift-card">
              <h2>Ditt nästa pass</h2>
              <div className="shift-info">
                <div className="time">{data?.nextShift.start} - {data?.nextShift.end}</div>
                <div className="detail">Linje: {data?.nextShift.line}</div>
                <div className="detail">Fordon: {data?.nextShift.vehicle}</div>
              </div>
              <div className="action-buttons">
                <button className="btn primary">Checka in</button>
                <button className="btn danger">Anmäl sjukdom</button>
              </div>
            </section>
            
            <section className="card alert">
              <AlertCircle className="icon" />
              <p>Kom ihåg att kontrollera din dygnsvila innan nästa pass.</p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
