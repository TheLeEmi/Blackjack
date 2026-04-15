// src/components/game/Lobby.jsx
import { useState } from 'react';

export default function Lobby({ user, onStartGame }) {
  const [mode, setMode] = useState('single'); 
  const [players, setPlayers] = useState([{ id: 'p1', name: user.username, isMe: true }]);
  const [showOnlineModal, setShowOnlineModal] = useState(false); // Stare pentru mesajul de dezvoltare

  const addPlayer = () => {
    if (players.length >= 4) return;
    const newPlayer = {
      id: `p${players.length + 1}`,
      name: `Jucător ${players.length + 1}`,
      isMe: false,
      balance: 1000 
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <div className="app-container">
      <div className="player-spot" style={{ maxWidth: '800px', margin: '50px auto', padding: '40px', position: 'relative' }}>
        <h2 style={{ color: 'gold', marginBottom: '30px', fontSize: '28px', textShadow: '0 2px 10px rgba(255,215,0,0.3)' }}>
          <img src="/icons/clubs.png" alt="" className="ui-icon" /> Configurare Masă VIP <img src="/icons/spades.png" alt="" className="ui-icon" />
        </h2>
        
        {/* Grila cu cele 3 moduri de joc */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <button 
            className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-warning'}`}
            style={{ opacity: mode === 'single' ? 1 : 0.7 }}
            onClick={() => { setMode('single'); setPlayers([{ id: 'p1', name: user.username, isMe: true }]); }}
          >
            <img src="/icons/single-player.png" alt="" className="ui-icon" /> Joacă Singur
          </button>
          
          <button 
            className={`btn ${mode === 'multi' ? 'btn-primary' : 'btn-warning'}`}
            style={{ opacity: mode === 'multi' ? 1 : 0.7 }}
            onClick={() => setMode('multi')}
          >
            <img src="/icons/multiplayer.png" alt="" className="ui-icon" /> Masă Locală
          </button>

          <button 
            className="btn btn-info"
            style={{ opacity: 0.8 }}
            onClick={() => setShowOnlineModal(true)}
          >
            <img src="/icons/online.png" alt="" className="ui-icon" /> Multiplayer Online
          </button>
        </div>

        {mode === 'multi' && (
          <div style={{ textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#ccc' }}>Locuri Ocupate ({players.length}/4)</h3>
              <button className="btn btn-info" onClick={addPlayer} disabled={players.length >= 4} style={{ padding: '8px 15px', fontSize: '14px', margin: 0 }}>
                + Invită Jucător
              </button>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
              {players.map((p, index) => (
                <li key={p.id} style={{ 
                  padding: '15px', 
                  backgroundColor: p.isMe ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.05)', 
                  marginBottom: '10px', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: p.isMe ? '4px solid #2ecc71' : '4px solid transparent'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    Scaunul {index + 1}: <strong style={{ color: p.isMe ? '#2ecc71' : 'white' }}>{p.name}</strong> {p.isMe && '(Tu)'}
                  </span>
                  {!p.isMe && (
                    <button onClick={() => removePlayer(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '18px', padding: '5px' }}>
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn btn-primary" style={{ marginTop: '30px', width: '100%', fontSize: '22px', padding: '15px' }} onClick={() => onStartGame(players)}>
          Așează-te la Masă <img src="/icons/arrow-right.png" alt="" className="ui-icon" style={{ marginLeft: '10px' }} />
        </button>

        {/* MODAL / OVERLAY PENTRU MODUL ONLINE */}
        {showOnlineModal && (
          <div style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.95)', borderRadius: '15px', zIndex: 100,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
          }}>
            <img src="/icons/construction.png" alt="In lucru" style={{ width: '120px', marginBottom: '20px' }} />
            <h2 style={{ color: 'gold' }}>Modul Online este în dezvoltare</h2>
            <p style={{ color: '#aaa', maxWidth: '300px' }}>
              Lucrăm la integrarea serverelor pentru a-ți permite să joci cu prietenii de la distanță.
            </p>
            <button className="btn btn-primary" onClick={() => setShowOnlineModal(false)} style={{ marginTop: '20px' }}>
              Am înțeles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}