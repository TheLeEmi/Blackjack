// src/App.jsx
import { useState, useEffect } from 'react';
import BlackjackGame from "./components/game/BlackjackGame.jsx";
import Lobby from "./components/game/Lobby.jsx"; // <-- Am adăugat importul pentru Lobby!
import CardCounting from './pages/CardCounting';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile.jsx';
import defaultUsersData from './data/users.json';
import './App.css';

export default function App() {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('blackjackUsers');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }
    return defaultUsersData;
  });

  useEffect(() => {
    localStorage.setItem('blackjackUsers', JSON.stringify(users));
  }, [users]);

  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState('blackjack');
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [activePlayers, setActivePlayers] = useState(null); // <-- Stare nouă pentru jucătorii de la masă

  const handleLogin = (loginData) => {
    let existingUser = users.find(u => u.username === loginData.username);
    
    if (existingUser) {
      if(existingUser.status === 'banat') {
        alert("Acest cont este BANAT!");
        return;
      }
      setUser(existingUser);
    } else {
      const newUser = {
        id: Date.now(),
        username: loginData.username,
        role: loginData.role,
        balance: 1000,
        status: "activ",
        wins: 0,
        totalGames: 0, 
        countAccuracy: 0
      };
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
    }
  };

  const updateUserData = (updates) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => {
        if (u.id === user.id) {
          const updated = { ...u };
          
          if (typeof updates === 'number') {
            updated.balance += updates;
          } else {
            if (updates.newName) updated.username = updates.newName;
            
            if (updates.balance !== undefined) updated.balance += updates.balance;
            if (updates.win) updated.wins = (updated.wins || 0) + 1;
            if (updates.gamePlayed) updated.totalGames = (updated.totalGames || 0) + 1;

            if (updates.countAttempted) {
              updated.totalCountAttempts = (updated.totalCountAttempts || 0) + 1;
              if (updates.countCorrect) {
                updated.correctCounts = (updated.correctCounts || 0) + 1; 
              }
              updated.countAccuracy = Math.round((updated.correctCounts / updated.totalCountAttempts) * 100) || 0;
            }
          }
          return updated;
        }
        return u;
      });

      const updatedCurrentUser = updatedUsers.find(u => u.id === user.id);
      setUser(updatedCurrentUser);

      return updatedUsers;
    });
  };

  // Funcția care primește jucătorii din Lobby și pornește meciul
  const handleStartGame = (playersList) => {
    setActivePlayers(playersList);
    setCurrentPage('blackjack');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <nav className="main-nav" style={{ justifyContent: 'space-between', padding: '15px 30px' }}>
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '22px' }}>
          ♣️ Casino Royal
        </div>

        <div className="nav-dropdown-container">
          <button 
            className="nav-btn active" 
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            👤 {user.username} | <span style={{ color: '#28a745' }}>${user.balance}</span> 
            <span style={{ fontSize: '12px' }}>{isMenuOpen ? '▲' : '▼'}</span>
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu" onClick={() => setIsMenuOpen(false)}>
              {/* Resetăm masa la click ca să te trimită mereu în Lobby */}
              <button className="dropdown-item" onClick={() => { setCurrentPage('blackjack'); setActivePlayers(null); }}>♠️ Masa de Joc</button>
              <button className="dropdown-item" onClick={() => setCurrentPage('counting')}>🧠 Antrenament</button>
              <button className="dropdown-item" onClick={() => setCurrentPage('leaderboard')}>🏆 Clasament</button>
              <button className="dropdown-item" onClick={() => setCurrentPage('profile')}>⚙️ Profilul Meu</button>
              
              {user.role === 'admin' && (
                <button className="dropdown-item" onClick={() => setCurrentPage('admin')} style={{ color: 'gold' }}>
                  👑 Admin Panel
                </button>
              )}
              
              <hr style={{ opacity: 0.2, margin: '5px 0' }} />
              <button 
                className="dropdown-item" 
                onClick={() => { setUser(null); setCurrentPage('blackjack'); setActivePlayers(null); }} 
                style={{ color: '#ff4444' }}
              >
                Deconectare
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* RANDARE CONDIȚIONATĂ PENTRU LOBBY / JOC */}
      {currentPage === 'blackjack' && (
        !activePlayers ? (
          <Lobby user={user} onStartGame={handleStartGame} />
        ) : (
          <BlackjackGame 
            user={user} 
            players={activePlayers} 
            onGameEnd={updateUserData} 
            onExit={() => setActivePlayers(null)} // Funcție ca să te întorci în lobby
          />
        )
      )}

      {currentPage === 'counting' && <CardCounting onTrainingEnd={updateUserData} />}      
      {currentPage === 'leaderboard' && <Leaderboard users={users} />}
      {currentPage === 'profile' && <Profile user={user} onUpdateData={updateUserData} />}
      {currentPage === 'admin' && user.role === 'admin' && <AdminDashboard users={users} setUsers={setUsers} />}
    </div>
  );
}