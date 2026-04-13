// src/pages/AdminDashboard.jsx
import { useState } from 'react';

export default function AdminDashboard({ users, setUsers }) {
  
  const toggleBanStatus = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === 'activ' ? 'banat' : 'activ' };
      }
      return user;
    }));
  };

  const toggleRole = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, role: user.role === 'admin' ? 'user' : 'admin' };
      }
      return user;
    }));
  };

  const resetBalance = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, balance: 0 };
      }
      return user;
    }));
  };

  const totalUsers = users.length;
  const activeAdmins = users.filter(u => u.role === 'admin').length;
  const totalEconomy = users.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="app-container">
      <h1 style={{ color: 'gold', textShadow: '0 2px 5px rgba(0,0,0,0.5)', marginBottom: '30px' }}>
        <img src="/icons/shield.png" alt="Security" className="ui-icon" /> Casino Security Terminal
      </h1>

      {/* Carduri de Statistici */}
      <div className="players-grid" style={{ marginBottom: '40px' }}>
        <div className="player-spot" style={{ padding: '20px', minWidth: '200px' }}>
          <h4 style={{ color: '#aaa', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Total Jucători</h4>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>{totalUsers}</div>
        </div>
        <div className="player-spot" style={{ padding: '20px', minWidth: '200px' }}>
          <h4 style={{ color: '#aaa', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Administratori</h4>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'gold' }}>{activeAdmins}</div>
        </div>
        <div className="player-spot" style={{ padding: '20px', minWidth: '200px' }}>
          <h4 style={{ color: '#aaa', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Economie Virtuală</h4>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2ecc71' }}>${totalEconomy.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabelul de Gestiune */}
      <div className="player-spot" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px', overflowX: 'auto' }}>
        <h3 style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', color: '#ccc' }}>Baza de date utilizatori</h3>
        
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left', marginTop: '15px' }}>
          <thead>
            <tr style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Username</th>
              <th style={{ padding: '15px' }}>Rol</th>
              <th style={{ padding: '15px' }}>Balanță</th>
              <th style={{ padding: '15px' }}>Acțiuni Rapide</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                opacity: user.status === 'banat' ? 0.5 : 1,
                borderLeft: user.status === 'banat' ? '4px solid #e74c3c' : '4px solid transparent'
              }}>
                <td style={{ padding: '15px', color: '#888', borderRadius: '10px 0 0 10px' }}>#{String(user.id).slice(-4)}</td>
                <td style={{ padding: '15px', fontWeight: 'bold', textDecoration: user.status === 'banat' ? 'line-through' : 'none' }}>
                  {user.username}
                </td>
                <td style={{ padding: '15px', color: user.role === 'admin' ? 'gold' : 'white' }}>
                  {user.role.toUpperCase()}
                </td>
                <td style={{ padding: '15px', color: '#2ecc71', fontWeight: 'bold' }}>
                  ${user.balance.toLocaleString()}
                </td>
                <td style={{ padding: '15px', borderRadius: '0 10px 10px 0' }}>
                  {/* Protejăm primul admin să nu fie șters din greșeală */}
                  {user.id !== 1 && user.username !== 'admin' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => toggleBanStatus(user.id)}
                        style={{ padding: '5px 10px', background: user.status === 'activ' ? '#e74c3c' : '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {user.status === 'activ' ? 'BAN' : 'UNBAN'}
                      </button>
                      <button 
                        onClick={() => toggleRole(user.id)}
                        style={{ padding: '5px 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {user.role === 'admin' ? 'Revocă Admin' : 'Dă Admin'}
                      </button>
                      <button 
                        onClick={() => resetBalance(user.id)}
                        style={{ padding: '5px 10px', background: 'transparent', color: '#f1c40f', border: '1px solid #f1c40f', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Reset $
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}