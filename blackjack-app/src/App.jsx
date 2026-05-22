// src/App.jsx
import { useState, useEffect } from 'react';
import BlackjackGame from "./components/game/BlackjackGame.jsx";
import Lobby from "./components/game/Lobby.jsx";
import CardCounting from './pages/CardCounting';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile.jsx';
import { io } from 'socket.io-client';
import './App.css';

export default function App() {
  const [users, setUsers] = useState([]); 
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('blackjack');
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [activePlayers, setActivePlayers] = useState(null); 
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'x-auth-token': token
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Eroare la auto-login:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Eroare la încărcarea utilizatorilor:', error);
      }
    };

    fetchUsers();
  }, [user]); 

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('blackjack');
    setActivePlayers(null);
  };

  // --- CONECTAREA LA MULTIPLAYER (SOCKET.IO) ---
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io('http://localhost:5000', {
        auth: { token: localStorage.getItem('token') } 
      });

      setSocket(newSocket);

      
      newSocket.on('connect', () => {
        console.log('✅ Conectat la serverul Multiplayer cu ID-ul:', newSocket.id);
      });
    }

    
    return () => {
      if (socket && !user) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [user, socket]);

  const updateUserData = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      let updatePayload = {};
      if (typeof updates === 'number') {
        updatePayload = { balance: updates }; 
      } else {
        updatePayload = updates; 
      }

      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Eroare la salvarea progresului:', error);
    }
  };

  const handleStartGame = (playersList) => {
    setActivePlayers(playersList);
    setCurrentPage('blackjack');
  };

  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'gold', fontSize: '24px' }}>
        Se verifică conexiunea securizată...
      </div>
    );
  }

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
                onClick={handleLogout} 
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
          <Lobby user={user} onStartGame={handleStartGame} socket={socket} />
        ) : (
          <BlackjackGame 
            user={user} 
            players={activePlayers} 
            onGameEnd={updateUserData} 
            onExit={() => setActivePlayers(null)}
            socket={socket} 
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