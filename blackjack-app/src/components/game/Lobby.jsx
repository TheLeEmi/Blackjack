// src/components/game/Lobby.jsx
import { useState, useEffect } from 'react';

export default function Lobby({ user, onStartGame, socket }) {
  const [mode, setMode] = useState('single'); 
  const [players, setPlayers] = useState([{ id: 'p1', name: user.username, isMe: true }]);
  
  
  const [roomCode, setRoomCode] = useState(''); // Codul generat de server
  const [joinCode, setJoinCode] = useState(''); // Codul tastat de utilizator
  const [errorMsg, setErrorMsg] = useState('');

  
  useEffect(() => {
    if (!socket) return;

  
    socket.on('roomCreated', (code) => {
      setRoomCode(code);
      setErrorMsg('');
    });

  
    socket.on('playersUpdated', (serverPlayers) => {
      const mappedPlayers = serverPlayers.map((p, index) => ({
        id: `p${index + 1}`, 
        socketId: p.id,      
        name: p.user.username,
        isMe: p.id === socket.id, 
        balance: p.user.balance || 1000
      }));
      setPlayers(mappedPlayers);
      setRoomCode(code => code || 'Conectat!');
      setErrorMsg('');
    });

    
    socket.on('roomError', (msg) => {
      setErrorMsg(msg);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('playersUpdated');
      socket.off('roomError');
    };
  }, [socket]);

  // --- FUNCTII PENTRU BUTOANE (SINGLE / MULTI LOCAL) ---
  const addLocalPlayer = () => {
    if (players.length >= 4) return;
    const newPlayer = {
      id: `p${players.length + 1}`,
      name: `Jucător ${players.length + 1}`,
      isMe: false,
      balance: 1000 
    };
    setPlayers([...players, newPlayer]);
  };

  const removeLocalPlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // --- FUNCTII PENTRU SOCKET.IO (ONLINE) ---
  const handleCreateRoom = () => {
    if (!socket) return setErrorMsg('Nu ești conectat la serverul online!');
    socket.emit('createRoom', user); 
  };

  const handleJoinRoom = () => {
    if (!socket) return setErrorMsg('Nu ești conectat la serverul online!');
    if (!joinCode) return setErrorMsg('Introdu un cod valid!');
    socket.emit('joinRoom', { roomCode: joinCode.toUpperCase(), userData: user });
  };

  return (
    <div className="app-container">
      <div className="player-spot" style={{ maxWidth: '800px', margin: '50px auto', padding: '40px', position: 'relative' }}>
        <h2 style={{ color: 'gold', marginBottom: '30px', fontSize: '28px', textShadow: '0 2px 10px rgba(255,215,0,0.3)' }}>
          <img src="/icons/clubs.png" alt="" className="ui-icon" /> Configurare Masă <img src="/icons/spades.png" alt="" className="ui-icon" />
        </h2>
        
        {/* Grila cu cele 3 moduri de joc */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <button 
            className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-warning'}`}
            style={{ opacity: mode === 'single' ? 1 : 0.7 }}
            onClick={() => { 
              setMode('single'); 
              setRoomCode('');
              setPlayers([{ id: 'p1', name: user.username, isMe: true }]); 
            }}
          >
            <img src="/icons/single-player.png" alt="" className="ui-icon" /> Joacă Singur
          </button>
          
          <button 
            className={`btn ${mode === 'multi-local' ? 'btn-primary' : 'btn-warning'}`}
            style={{ opacity: mode === 'multi-local' ? 1 : 0.7 }}
            onClick={() => {
              setMode('multi-local');
              setRoomCode('');
              setPlayers([{ id: 'p1', name: user.username, isMe: true }]);
            }}
          >
            <img src="/icons/multiplayer.png" alt="" className="ui-icon" /> Masă Locală
          </button>

          <button 
            className={`btn ${mode === 'online' ? 'btn-info' : 'btn-warning'}`}
            style={{ opacity: mode === 'online' ? 1 : 0.7, background: mode === 'online' ? '#3498db' : undefined }}
            onClick={() => {
              setMode('online');
              setPlayers([{ id: 'p1', name: user.username, isMe: true }]); 
            }}
          >
            <img src="/icons/online.png" alt="" className="ui-icon" /> Online (Beta)
          </button>
        </div>

        {/* MODUL MULTIPLAYER LOCAL */}
        {mode === 'multi-local' && (
          <div style={{ textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#ccc' }}>Scaune Ocupate ({players.length}/4)</h3>
              <button className="btn btn-info" onClick={addLocalPlayer} disabled={players.length >= 4} style={{ padding: '8px 15px', fontSize: '14px', margin: 0 }}>
                + Adaugă Jucător
              </button>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
              {players.map((p, index) => (
                <li key={p.id} style={{ 
                  padding: '15px', backgroundColor: p.isMe ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.05)', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: p.isMe ? '4px solid #2ecc71' : '4px solid transparent'
                }}>
                  <span style={{ fontSize: '16px' }}>Scaunul {index + 1}: <strong style={{ color: p.isMe ? '#2ecc71' : 'white' }}>{p.name}</strong> {p.isMe && '(Tu)'}</span>
                  {!p.isMe && (
                    <button onClick={() => removeLocalPlayer(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '18px', padding: '5px' }}>✕</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* MODUL ONLINE (WEBSOCKETS) */}
        {mode === 'online' && (
          <div style={{ textAlign: 'left', backgroundColor: 'rgba(52, 152, 219, 0.1)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
            
            
            {!roomCode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={handleCreateRoom} style={{ flex: 1, padding: '15px' }}>
                    + Creează Masă Nouă
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <hr style={{ flex: 1, opacity: 0.2 }} />
                  <span style={{ color: '#aaa', fontSize: '14px' }}>SAU ALĂTURĂ-TE</span>
                  <hr style={{ flex: 1, opacity: 0.2 }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Cod Masă (ex: X9A2)" 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    style={{ flex: 2, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '18px', textAlign: 'center', textTransform: 'uppercase' }}
                    maxLength={4}
                  />
                  <button className="btn btn-warning" onClick={handleJoinRoom} style={{ flex: 1 }}>
                    Intră
                  </button>
                </div>
                {errorMsg && <div style={{ color: '#ff4444', textAlign: 'center', marginTop: '10px' }}>{errorMsg}</div>}
              </div>
            ) : (
              
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#ccc' }}>Masa Ta</h3>
                  <div style={{ background: '#f1c40f', color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>
                    COD: {roomCode}
                  </div>
                </div>
                
                <p style={{ color: '#aaa', fontSize: '14px', marginTop: '15px', textAlign: 'center' }}>
                  Dă acest cod prietenilor tăi pentru a se conecta! ({players.length}/4 Jucători)
                </p>

                <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                  {players.map((p, index) => (
                    <li key={p.id} style={{ 
                      padding: '15px', backgroundColor: p.isMe ? 'rgba(52, 152, 219, 0.2)' : 'rgba(255,255,255,0.05)', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: p.isMe ? '4px solid #3498db' : '4px solid transparent'
                    }}>
                      <span style={{ fontSize: '16px' }}>
                        {index === 0 && <span style={{ color: 'gold', marginRight: '5px' }}>★</span>} {/* Cel care creează e "VIP" */}
                        Scaunul {index + 1}: <strong style={{ color: p.isMe ? '#3498db' : 'white' }}>{p.name}</strong> {p.isMe && '(Tu)'}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <button 
          className="btn btn-primary" 
          style={{ marginTop: '30px', width: '100%', fontSize: '22px', padding: '15px' }} 
          onClick={() => onStartGame(players)}
          disabled={mode === 'online' && !roomCode} 
        >
          {mode === 'online' ? 'Începe Jocul Online' : 'Așează-te la Masă'} <img src="/icons/arrow-right.png" alt="" className="ui-icon" style={{ marginLeft: '10px' }} />
        </button>

      </div>
    </div>
  );
}