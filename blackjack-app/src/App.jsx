// src/App.jsx
import { useState } from 'react';
import BlackjackGame from "./components/game/BlackjackGame.jsx";
import CardCounting from './pages/CardCounting';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState('blackjack');

  const updateBalance = (amount) => {
    setUser(prev => ({
      ...prev,
      balance: prev.balance + amount
    }));
  };

  // Dacă nu avem user, afișăm componenta de Login
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  
  return (
    <div>
      <nav className="main-nav">
        <div style={{ position: 'absolute', left: '20px', color: '#aaa', marginTop: '10px' }}>
          <span>Salut, <strong>{user.username}</strong></span>
          <span 
            style={{ marginLeft: '15px', cursor: 'pointer', textDecoration: 'underline' }} 
            onClick={() => setUser(null)}
          >
            Logout
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => setCurrentPage('blackjack')} 
            className={`nav-btn ${currentPage === 'blackjack' ? 'active' : 'inactive'}`}
          >
            Masa de Joc
          </button>
          <button 
            onClick={() => setCurrentPage('counting')} 
            className={`nav-btn ${currentPage === 'counting' ? 'active' : 'inactive'}`}
          >
            Antrenament
          </button>

          <button
            onClick={() => setCurrentPage('leaderboard')}
            className={`nav-btn ${currentPage === 'leaderboard' ? 'active' : ''}`}
          >
            Leaderboard
          </button>
          
          {/* Dashboard-ul de Admin */}
          {user.role === 'admin' && (
            <button 
              onClick={() => setCurrentPage('admin')} 
              className={`nav-btn ${currentPage === 'admin' ? 'active' : 'inactive'}`}
              style={{ borderColor: 'gold', color: 'gold' }}
            >
              👑 Admin Panel
            </button>
          )}
        </div>
      </nav>

      {/* RUTELE PAGINILOR */}
      {currentPage === 'blackjack' && <BlackjackGame />}
      {currentPage === 'counting' && <CardCounting />}
      {currentPage === 'leaderboard' && <Leaderboard />}
      {currentPage === 'admin' && user.role === 'admin' && <AdminDashboard />}
      {currentPage === 'admin' && user.role === 'admin' && (
        <div className="app-container">
          <h1>Admin Dashboard</h1>
          <p>Aici vei vedea statisticile tuturor utilizatorilor. (În curând)</p>
        </div>
      )}
    </div>
  );
}