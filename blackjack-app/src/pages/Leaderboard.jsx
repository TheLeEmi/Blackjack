// src/pages/Leaderboard.jsx
import { useState } from 'react';
import './Leaderboard.css';

export default function Leaderboard({ users }) {
  const [sortBy, setSortBy] = useState('wins'); // 'wins' sau 'accuracy'

  // Sortăm utilizatorii REALI pe care îi primim din App.jsx
  // Folosim fallback la 0 în caz că un user nou nu are încă proprietatea "wins"
  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'wins') return (b.wins || 0) - (a.wins || 0);
    return (b.countAccuracy || 0) - (a.countAccuracy || 0);
  });

  return (
    <div className="app-container">
      <h1>🏆 Clasament Jucători</h1>
      
      <div className="leaderboard-card">
        <div style={{ marginBottom: '20px' }}>
          <span>Sortează după: </span>
          <button 
            className={`btn ${sortBy === 'wins' ? 'btn-primary' : 'btn-info'}`}
            onClick={() => setSortBy('wins')}
            style={{ fontSize: '14px' }}
          >
            Victorii Blackjack
          </button>
          <button 
            className={`btn ${sortBy === 'accuracy' ? 'btn-primary' : 'btn-info'}`}
            onClick={() => setSortBy('accuracy')}
            style={{ fontSize: '14px' }}
          >
            Acuratețe Numărat
          </button>
        </div>

        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Loc</th>
              <th>Jucător</th>
              <th>Victorii</th>
              <th>Acuratețe Card Counting</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr key={user.id} style={{ opacity: user.status === 'banat' ? 0.5 : 1 }}>
                <td className={index === 0 ? "rank-gold" : index === 1 ? "rank-silver" : index === 2 ? "rank-bronze" : ""}>
                  #{index + 1}
                </td>
                <td>
                  {user.username} {user.status === 'banat' && '(Banat)'}
                  {user.role === 'admin' && ' 👑'}
                </td>
                <td>{user.wins || 0}</td>
                <td>
                  <div className="accuracy-bar-container">
                    <div className="accuracy-bar-fill" style={{ width: `${user.countAccuracy || 0}%` }}></div>
                  </div>
                  {user.countAccuracy || 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}