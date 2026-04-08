// src/pages/AdminDashboard.jsx
import { useState } from 'react';
import usersData from '../data/users.json';
import './AdminDashboard.css';

export default function AdminDashboard() {
  // Încărcăm datele din JSON în starea locală a paginii
  const [users, setUsers] = useState(usersData);

  // Funcție pentru a da BAN sau a debloca un user
  const toggleBanStatus = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === 'activ' ? 'banat' : 'activ' };
      }
      return user;
    }));
  };

  // Funcție pentru a schimba rolul (User <-> Admin)
  const toggleRole = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, role: user.role === 'admin' ? 'user' : 'admin' };
      }
      return user;
    }));
  };

  // Funcție pentru a reseta banii unui user la 0 (dacă trișează)
  const resetBalance = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, balance: 0 };
      }
      return user;
    }));
  };

  // Calcule pentru cardurile de statistici
  const totalUsers = users.length;
  const activeAdmins = users.filter(u => u.role === 'admin').length;
  const totalEconomy = users.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="app-container">
      <h1 style={{ color: 'gold', marginBottom: '30px' }}> Panou de Control Administrator</h1>

      {/* STATISTICI GENERALE */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Utilizatori</h3>
          <div className="number">{totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Administratori</h3>
          <div className="number">{activeAdmins}</div>
        </div>
        <div className="stat-card">
          <h3>Economie Virtuală (Total Bani)</h3>
          <div className="number">${totalEconomy.toLocaleString()}</div>
        </div>
      </div>

      {/* TABEL GESTIUNE UTILIZATORI */}
      <div className="admin-table-container">
        <h2 style={{ textAlign: 'left', marginBottom: '15px' }}>Gestiune Utilizatori</h2>
        <table className="leaderboard-table" style={{ marginTop: '0' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Rol</th>
              <th>Status</th>
              <th>Balanță ($)</th>
              <th>Acțiuni Rapide</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ opacity: user.status === 'banat' ? 0.6 : 1 }}>
                <td>#{user.id}</td>
                <td>{user.username}</td>
                <td>
                  <span style={{ color: user.role === 'admin' ? 'gold' : 'white' }}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className={`status-${user.status}`}>
                  {user.status.toUpperCase()}
                </td>
                <td>${user.balance.toLocaleString()}</td>
                <td>
                  {/* Nu lăsăm adminul principal să își dea ban singur */}
                  {user.id !== 1 && (
                    <>
                      <button 
                        className={`action-btn ${user.status === 'activ' ? 'btn-ban' : 'btn-promote'}`}
                        onClick={() => toggleBanStatus(user.id)}
                      >
                        {user.status === 'activ' ? 'Ban' : 'Unban'}
                      </button>
                      <button 
                        className="action-btn btn-promote"
                        onClick={() => toggleRole(user.id)}
                      >
                        Make {user.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button 
                        className="action-btn btn-reset"
                        onClick={() => resetBalance(user.id)}
                      >
                        Reset $
                      </button>
                    </>
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