// src/pages/Leaderboard.jsx
import { useState } from 'react';

export default function Leaderboard({ users }) {
  const [sortBy, setSortBy] = useState('wins'); 

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'wins') return (b.wins || 0) - (a.wins || 0);
    return (b.countAccuracy || 0) - (a.countAccuracy || 0);
  });

  return (
    <div className="app-container">
      <h1 style={{ color: 'gold', textShadow: '0 2px 5px rgba(0,0,0,0.5)', marginBottom: '30px' }}>
        <img src="/icons/trophy.png" alt="Trophy" className="ui-icon" /> Hall of Fame
      </h1>
      
      <div className="player-spot" style={{ maxWidth: '900px', margin: '0 auto', padding: '30px' }}>
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <span style={{ alignSelf: 'center', color: '#ccc', fontWeight: 'bold' }}>Criteriu: </span>
          <button 
            className={`btn ${sortBy === 'wins' ? 'btn-primary' : 'btn-warning'}`}
            style={{ opacity: sortBy === 'wins' ? 1 : 0.7 }}
            onClick={() => setSortBy('wins')}
          >
            Victorii Blackjack
          </button>
          <button 
            className={`btn ${sortBy === 'accuracy' ? 'btn-primary' : 'btn-warning'}`}
            style={{ opacity: sortBy === 'accuracy' ? 1 : 0.7 }}
            onClick={() => setSortBy('accuracy')}
          >
            Acuratețe Numărat
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>
                <th style={{ padding: '15px' }}>Rang</th>
                <th style={{ padding: '15px' }}>Jucător</th>
                <th style={{ padding: '15px' }}>Victorii</th>
                <th style={{ padding: '15px' }}>Win Rate</th>
                <th style={{ padding: '15px' }}>Card Counting</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, index) => {
                const winRate = user.totalGames > 0 ? ((user.wins / user.totalGames) * 100).toFixed(1) : 0;
                
                let rankColor = '#ccc';
                let rowBg = 'rgba(255,255,255,0.03)';
                if (index === 0) { rankColor = 'gold'; rowBg = 'rgba(255,215,0,0.1)'; }
                else if (index === 1) { rankColor = '#C0C0C0'; rowBg = 'rgba(192,192,192,0.1)'; }
                else if (index === 2) { rankColor = '#CD7F32'; rowBg = 'rgba(205,127,50,0.1)'; }

                return (
                  <tr key={user.id} style={{ 
                    backgroundColor: rowBg, 
                    opacity: user.status === 'banat' ? 0.4 : 1,
                    transition: 'transform 0.2s'
                  }}>
                    <td style={{ padding: '15px', color: rankColor, fontWeight: 'bold', fontSize: index < 3 ? '20px' : '16px', borderRadius: '10px 0 0 10px' }}>
                      #{index + 1}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>
                      {user.username} {user.status === 'banat' && <span style={{ color: '#ff4444', fontSize: '12px' }}>(Banat)</span>}
                      {user.role === 'admin' && <img src="/icons/crown.png" alt="Admin" className="ui-icon" style={{marginLeft: '5px', width: '16px', height: '16px'}} />}
                    </td>
                    <td style={{ padding: '15px', color: '#2ecc71', fontWeight: 'bold' }}>{user.wins || 0}</td>
                    <td style={{ padding: '15px' }}>{winRate}%</td>
                    <td style={{ padding: '15px', borderRadius: '0 10px 10px 0' }}>
                      <div style={{ width: '100px', background: 'rgba(0,0,0,0.5)', height: '8px', borderRadius: '4px', display: 'inline-block', marginRight: '10px' }}>
                        <div style={{ height: '100%', background: '#3498db', borderRadius: '4px', width: `${user.countAccuracy || 0}%` }}></div>
                      </div>
                      {user.countAccuracy || 0}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}