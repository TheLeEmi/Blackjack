// src/pages/AdminDashboard.jsx
import './AdminDashboard.css';

// Observă că acum primește "users" și "setUsers" ca "Props" de la App.jsx
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
      <h1 style={{ color: 'gold', marginBottom: '30px' }}>👑 Panou de Control Administrator</h1>

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
                  {user.username !== 'admin' && ( // L-am protejat pe adminul "suprem" după nume
                    <>
                      <button className={`action-btn ${user.status === 'activ' ? 'btn-ban' : 'btn-promote'}`} onClick={() => toggleBanStatus(user.id)}>
                        {user.status === 'activ' ? 'Ban' : 'Unban'}
                      </button>
                      <button className="action-btn btn-promote" onClick={() => toggleRole(user.id)}>
                        Make {user.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button className="action-btn btn-reset" onClick={() => resetBalance(user.id)}>
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