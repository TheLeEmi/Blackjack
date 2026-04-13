// src/App.jsx
import { useState, useEffect } from 'react';
import BlackjackGame from "./components/game/BlackjackGame.jsx";
import Lobby from "./components/game/Lobby.jsx";
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
  const [activePlayers, setActivePlayers] = useState(null); 

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

  const handleStartGame = (playersList) => {
    setActivePlayers(playersList);
    setCurrentPage('blackjack');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <nav className="main-nav">
        <div className="nav-title">
          <img src="/icons/clubs.png" alt="Clubs" className="ui-icon" /> Casino Royal
        </div>

        <div className="nav-dropdown-container">
          <button 
            className="nav-btn active" 
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img src="/icons/user.png" alt="User" className="ui-icon" /> {user.username} | <span style={{ color: '#28a745' }}>${user.balance}</span> 
            <span style={{ fontSize: '12px' }}>{isMenuOpen ? '▲' : '▼'}</span>
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu" onClick={() => setIsMenuOpen(false)}>
              <button className="dropdown-item" onClick={() => { setCurrentPage('blackjack'); setActivePlayers(null); }}>
                <img src="/icons/spades.png" alt="Spades" className="ui-icon" /> Masa de Joc
              </button>
              <button className="dropdown-item" onClick={() => setCurrentPage('counting')}>
                <img src="/icons/brain.png" alt="Brain" className="ui-icon" /> Antrenament
              </button>
              <button className="dropdown-item" onClick={() => setCurrentPage('leaderboard')}>
                <img src="/icons/trophy.png" alt="Trophy" className="ui-icon" /> Clasament
              </button>
              <button className="dropdown-item" onClick={() => setCurrentPage('profile')}>
                <img src="/icons/settings.png" alt="Settings" className="ui-icon" /> Profilul Meu
              </button>
              
              {user.role === 'admin' && (
                <button className="dropdown-item" onClick={() => setCurrentPage('admin')} style={{ color: 'gold' }}>
                  <img src="/icons/crown.png" alt="Admin" className="ui-icon" /> Admin Panel
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

      {currentPage === 'blackjack' && (
        !activePlayers ? (
          <Lobby user={user} onStartGame={handleStartGame} />
        ) : (
          <BlackjackGame 
            user={user} 
            players={activePlayers} 
            onGameEnd={updateUserData} 
            onExit={() => setActivePlayers(null)}
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