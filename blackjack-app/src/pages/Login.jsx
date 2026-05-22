// src/pages/Login.jsx
import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert("Completează toate câmpurile!");

    const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return alert(data.msg || "Eroare la autentificare");
      }
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      
    } catch (error) {
      console.error("Eroare de conexiune:", error);
      alert("Nu mă pot conecta la serverul backend! Asigură-te că rulează pe portul 5000.");
    }
  };

  const handleGuest = () => {
    onLogin({ _id: 'guest', username: 'Vizitator', role: 'guest', balance: 1000 });
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