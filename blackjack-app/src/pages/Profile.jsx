// src/pages/Profile.jsx
import { useState } from 'react';
import './Profile.css';

export default function Profile({ user, onUpdateBalance }) {
  const [depositAmount, setDepositAmount] = useState(100);

  const handleDeposit = () => {
    if (depositAmount <= 0) return;
    onUpdateBalance(Number(depositAmount));
    alert(`Ai depus $${depositAmount} cu succes!`);
  };

  return (
    <div className="app-container">
      <div className="profile-card">
        <h2>Profil Utilizator: {user.username}</h2>
        <p>Rol: <strong>{user.role}</strong></p>
        
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
  );
}