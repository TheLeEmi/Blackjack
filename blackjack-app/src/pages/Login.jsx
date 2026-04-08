// src/pages/Login.jsx
import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (!username || !password) return alert("Completează toate câmpurile!");

    // Simulăm un user normal
    // În viitor, aici vei face cererea către Backend (Node.js)
    onLogin({ 
      username, 
      role: username.toLowerCase() === 'admin' ? 'admin' : 'user' 
    });
  };

  const handleGuest = () => {
    onLogin({ username: 'Guest', role: 'guest' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignup ? 'Creează Cont' : 'Autentificare'}</h2>
        
        <form onSubmit={handleAuth}>
          <div className="input-group">
            <label>Utilizator</label>
            <input 
              className="login-input" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="ex: emilian"
            />
          </div>
          
          <div className="input-group">
            <label>Parolă</label>
            <input 
              className="login-input" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          <div className="auth-buttons">
            <button type="submit" className="btn btn-primary">
              {isSignup ? 'Înregistrare' : 'Login'}
            </button>
            <button 
              type="button" 
              className="btn btn-info" 
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Ai deja cont? Login' : 'Vreau cont nou'}
            </button>
          </div>
        </form>

        <span className="guest-link" onClick={handleGuest}>
          Continuă ca vizitator (Guest)
        </span >
      </div>
    </div>
  );
}