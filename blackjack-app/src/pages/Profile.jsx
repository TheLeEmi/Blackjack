// src/pages/Profile.jsx
import { useState } from 'react';
import './Profile.css';

export default function Profile({ user, onUpdateData }) {
  const [depositAmount, setDepositAmount] = useState(100);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.username);

  // Calculăm Rata de Câștig
  const winRate = user.totalGames > 0 
    ? ((user.wins / user.totalGames) * 100).toFixed(1) 
    : 0;

  const handleDeposit = () => {
    if (depositAmount <= 0) return;
    onUpdateData(Number(depositAmount)); // Trimitem numărul pentru bani
    alert(`Ai depus $${depositAmount} cu succes!`);
  };

  const handleSaveName = () => {
    if (!newName.trim()) return;
    onUpdateData({ newName: newName }); // Trimitem un obiect cu noul nume
    setIsEditingName(false);
  };

  return (
    <div className="app-container">
      <div className="profile-card">
        
        {/* Antetul Profilului cu opțiunea de editare */}
        <div className="profile-header" style={{ marginBottom: '30px' }}>
          {isEditingName ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <input 
                type="text" 
                className="deposit-input" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                style={{ marginBottom: '0' }}
              />
              <button className="btn btn-primary" onClick={handleSaveName}>Salvează</button>
              <button className="btn btn-warning" onClick={() => setIsEditingName(false)}>Anulează</button>
            </div>
          ) : (
            <h2>
              Profil Utilizator: {user.username}
              <button 
                onClick={() => setIsEditingName(true)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginLeft: '10px' }}
              >
                ✏️
              </button>
            </h2>
          )}
          <p style={{ color: '#aaa' }}>Rol: <strong style={{ color: user.role === 'admin' ? 'gold' : 'white' }}>{user.role}</strong></p>
        </div>

        {/* Zona de Statistici */}
        <div className="stats-grid">
          <div className="stat-box">
            <h4>Jocuri Jucate</h4>
            <p className="stat-number">{user.totalGames || 0}</p>
          </div>
          <div className="stat-box">
            <h4>Victorii</h4>
            <p className="stat-number" style={{ color: '#28a745' }}>{user.wins || 0}</p>
          </div>
          <div className="stat-box">
            <h4>Win Rate</h4>
            <p className="stat-number">{winRate}%</p>
          </div>
          <div className="stat-box">
            <h4>Acuratețe Numărat</h4>
            <p className="stat-number" style={{ color: '#17a2b8' }}>{user.countAccuracy || 0}%</p>
          </div>
        </div>

        {/* Zona de Finanțe */}
        <div className="finance-section">
          <div className="balance-display">
            ${user.balance.toLocaleString()}
          </div>
          <p>Balanță Curentă</p>

          <div className="deposit-section">
            <h3>Adaugă Fonduri (Demo)</h3>
            <input 
              type="number" 
              className="deposit-input"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <br />
            <button className="btn btn-primary" onClick={handleDeposit}>
              Depune Bani
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}