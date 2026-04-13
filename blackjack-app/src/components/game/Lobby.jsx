// src/components/game/Lobby.jsx
import { useState } from 'react';

export default function Lobby({ user, onStartGame }) {
  const [mode, setMode] = useState('single'); // 'single' sau 'multi'
  const [players, setPlayers] = useState([{ id: 'p1', name: user.username, isMe: true }]);

  const addPlayer = () => {
    if (players.length >= 4) return;
    const newPlayer = {
      id: `p${players.length + 1}`,
      name: `Jucător ${players.length + 1}`,
      isMe: false,
      balance: 1000 // Balanță simulată pentru invitați
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <div className="app-container">
      <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '40px', borderRadius: '15px', maxWidth: '600px', margin: '50px auto' }}>
        <h2 style={{ color: 'gold', marginBottom: '20px' }}>♣️ Configurare Masă Blackjack ♠️</h2>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
          <button 
            className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => { setMode('single'); setPlayers([{ id: 'p1', name: user.username, isMe: true }]); }}
          >
            👤 Singleplayer
          </button>
          <button 
            className={`btn ${mode === 'multi' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setMode('multi')}
          >
            👥 Multiplayer Local
          </button>
        </div>

        {mode === 'multi' && (
          <div style={{ textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Jucători la Masă ({players.length}/4)</h3>
              <button className="btn btn-info" onClick={addPlayer} disabled={players.length >= 4} style={{ padding: '5px 10px', fontSize: '14px' }}>
                + Adaugă Loc
              </button>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
              {players.map((p, index) => (
                <li key={p.id} style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Loc {index + 1}: <strong>{p.name}</strong> {p.isMe && '(Tu)'}</span>
                  {!p.isMe && (
                    <button onClick={() => removePlayer(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>❌</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn btn-primary" style={{ marginTop: '30px', width: '100%', fontSize: '20px' }} onClick={() => onStartGame(players)}>
          Începe Jocul ➡️
        </button>
      </div>
    </div>
  );
}