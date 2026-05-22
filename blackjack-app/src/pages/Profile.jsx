// src/pages/Profile.jsx
import { useState } from 'react';
import './Profile.css';

export default function Profile({ user, onUpdateData }) {
  const [depositAmount, setDepositAmount] = useState(100);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.username);
  const [showPaymentModal, setShowPaymentModal] = useState(false); 

  const winRate = user.totalGames > 0 
    ? ((user.wins / user.totalGames) * 100).toFixed(1) 
    : 0;

  const handleOpenPayment = () => {
    if (depositAmount <= 0) return;
    setShowPaymentModal(true); 
  };

  const confirmPayment = (e) => {
    e.preventDefault(); 
    onUpdateData(Number(depositAmount)); 
    setShowPaymentModal(false);
    alert(`Plată procesată! Ai depus $${depositAmount} cu succes.`);
  };

  const handleSaveName = () => {
    if (!newName.trim()) return;
    onUpdateData({ newName: newName }); 
    setIsEditingName(false);
  };

  return (
    <div className="app-container">
      <div className="profile-card">
        
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}
                >
                  <img src="/icons/edit.png" alt="Edit" className="ui-icon" />
                </button>
            </h2>
          )}
          <p style={{ color: '#aaa' }}>Rol: <strong style={{ color: user.role === 'admin' ? 'gold' : 'white' }}>{user.role}</strong></p>
        </div>
        
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
        
        <div className="finance-section">
          <div className="balance-display">
            ${user.balance.toLocaleString()}
          </div>
          <p>Balanță Curentă</p>

          <div className="deposit-section">
            <h3>Adaugă Fonduri</h3>
            <input 
              type="number" 
              className="deposit-input"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <br />
            <button className="btn btn-primary" onClick={handleOpenPayment}>
              Continuă la Plată
            </button>
          </div>
        </div>

      </div>

      {/* --- MODULUL DE PLATĂ SIMULATA --- */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <h3 style={{ color: 'white', borderBottom: '1px solid #444', paddingBottom: '15px', marginTop: 0 }}>
              💳 Casierie Securizată
            </h3>
            
            <div className="warning-banner">
              <strong>⚠️ ATENȚIE: PROIECT PORTFOLIO</strong><br/>
              Aceasta este o simulare. <strong>NU</strong> introduceți datele unui card bancar real. Puteți tasta orice numere fictive pentru a testa funcționalitatea.
            </div>

            <form onSubmit={confirmPayment}>
              <div className="payment-input-group">
                <label>Numele de pe card</label>
                <input type="text" className="payment-field" placeholder="ex: ION POPESCU" required />
              </div>
              
              <div className="payment-input-group">
                <label>Numărul Cardului</label>
                <input type="text" className="payment-field" placeholder="0000 0000 0000 0000" maxLength="19" required />
              </div>

              <div className="payment-row">
                <div className="payment-input-group" style={{ flex: 1 }}>
                  <label>Data Expirării</label>
                  <input type="text" className="payment-field" placeholder="LL/AA" maxLength="5" required />
                </div>
                <div className="payment-input-group" style={{ flex: 1 }}>
                  <label>Cod CVV</label>
                  <input type="password" className="payment-field" placeholder="123" maxLength="3" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '15px' }}>
                  Plătește ${depositAmount}
                </button>
                <button type="button" className="btn btn-warning" onClick={() => setShowPaymentModal(false)} style={{ flex: 1 }}>
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}