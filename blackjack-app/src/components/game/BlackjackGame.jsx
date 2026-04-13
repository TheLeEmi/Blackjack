// src/components/game/BlackjackGame.jsx
import { useState, useEffect } from 'react';
import { createDeck, shuffleDeck, calculateScore } from '../../utils/deckLogic';
import Card from './Card';

export default function BlackjackGame({ user, players, onGameEnd, onExit }) {
  const [gameState, setGameState] = useState('betting'); // 'betting', 'playing', 'dealerTurn', 'gameOver'
  const [deck, setDeck] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  
  // Starea tuturor jucătorilor de la masă
  const [playerStates, setPlayerStates] = useState(() => 
    players.map(p => ({ ...p, hand: [], bet: 10, status: 'waiting', result: '' }))
  );
  
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  // --- FAZA 1: PARIEREA ---
  const handleBetChange = (index, value) => {
    const newStates = [...playerStates];
    newStates[index].bet = Number(value);
    setPlayerStates(newStates);
  };

  const placeBetsAndStart = () => {
    const mainUser = playerStates.find(p => p.isMe);
    if (mainUser && mainUser.bet > user.balance) {
      alert("Nu ai suficienți bani în cont pentru acest pariu!");
      return;
    }

    // Scădem pariul utilizatorului principal din cont
    if (mainUser) onGameEnd(-mainUser.bet); 

    // Împărțim cărțile
    let currentDeck = shuffleDeck(createDeck());
    let newPlayerStates = [...playerStates];
    
    newPlayerStates.forEach(p => {
      p.hand = [currentDeck.pop(), currentDeck.pop()];
      p.status = 'playing';
      p.result = '';
    });

    setDealerHand([currentDeck.pop(), currentDeck.pop()]);
    setPlayerStates(newPlayerStates);
    setDeck(currentDeck);
    setActivePlayerIndex(0);
    setGameState('playing');
  };

  // --- FAZA 2: JOCUL (RÂND PE RÂND) ---
  const advanceTurn = (currentStates) => {
    const nextIndex = activePlayerIndex + 1;
    setPlayerStates(currentStates);
    
    if (nextIndex >= currentStates.length) {
      // Toți jucătorii au terminat, e rândul Dealerului
      setGameState('dealerTurn');
    } else {
      // Trece la următorul jucător
      setActivePlayerIndex(nextIndex);
    }
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    
    let newStates = [...playerStates];
    let currentPlayer = newStates[activePlayerIndex];
    let newDeck = [...deck];
    
    currentPlayer.hand.push(newDeck.pop());
    
    if (calculateScore(currentPlayer.hand) > 21) {
      currentPlayer.status = 'bust';
      advanceTurn(newStates);
    } else {
      setPlayerStates(newStates);
    }
    setDeck(newDeck);
  };

  const stand = () => {
    if (gameState !== 'playing') return;
    let newStates = [...playerStates];
    newStates[activePlayerIndex].status = 'stand';
    advanceTurn(newStates);
  };

  // --- FAZA 3: RÂNDUL DEALERULUI ȘI REZULTATELE ---
  useEffect(() => {
    if (gameState === 'dealerTurn') {
      const dealerScore = calculateScore(dealerHand);
      if (dealerScore < 17) {
        setTimeout(() => {
          const newDeck = [...deck];
          setDealerHand([...dealerHand, newDeck.pop()]);
          setDeck(newDeck);
        }, 800);
      } else {
        determineWinners(dealerScore);
      }
    }
  }, [gameState, dealerHand]);

  const determineWinners = (dScore) => {
    let newStates = [...playerStates];
    let mainUserPayout = 0;
    let mainUserWon = false;

    newStates.forEach(p => {
      if (p.status === 'bust') {
        p.result = 'Bust! Ai pierdut.';
      } else {
        const pScore = calculateScore(p.hand);
        if (dScore > 21) {
          p.result = 'Câștigător! (Dealer Bust)';
          if (p.isMe) { mainUserPayout += p.bet * 2; mainUserWon = true; }
        } else if (pScore > dScore) {
          p.result = 'Câștigător!';
          if (p.isMe) { mainUserPayout += p.bet * 2; mainUserWon = true; }
        } else if (pScore === dScore) {
          p.result = 'Egalitate (Push)';
          if (p.isMe) { mainUserPayout += p.bet; }
        } else {
          p.result = 'Dealerul a câștigat!';
        }
      }
      p.status = 'done';
    });

    setPlayerStates(newStates);
    setGameState('gameOver');
    
    // Trimitem rezultatul contului principal către App.jsx
    if (newStates.some(p => p.isMe)) {
      onGameEnd({ balance: mainUserPayout, gamePlayed: true, win: mainUserWon });
    }
  };

  // --- RANDARE (UI) ---
  if (gameState === 'betting') {
    return (
      <div className="app-container">
        <button className="btn btn-warning" onClick={onExit} style={{ position: 'absolute', top: '100px', left: '20px' }}>
          ⬅️ Înapoi la Lobby
        </button>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '30px', borderRadius: '15px', display: 'inline-block', marginTop: '50px' }}>
          <h2>Plasează Pariurile</h2>
          <div style={{ display: 'flex', gap: '20px', margin: '20px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
            {playerStates.map((p, index) => (
              <div key={p.id} style={{ backgroundColor: p.isMe ? 'rgba(40,167,69,0.2)' : 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                <h4>{p.name} {p.isMe && `(Bal: $${user.balance})`}</h4>
                <input 
                  type="number" 
                  value={p.bet} 
                  onChange={(e) => handleBetChange(index, e.target.value)}
                  style={{ padding: '8px', width: '80px', textAlign: 'center', marginTop: '10px' }}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={placeBetsAndStart} style={{ fontSize: '20px', padding: '10px 40px' }}>
            Împarte Cărțile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER CONTROALE */}
      <div style={{ minHeight: '80px', marginBottom: '20px' }}>
        {gameState === 'playing' && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '10px', display: 'inline-block' }}>
            <h3 style={{ color: 'gold', margin: '0 0 10px 0' }}>Rândul lui: {playerStates[activePlayerIndex].name}</h3>
            <button onClick={hit} className="btn btn-primary">Hit (Trage)</button>
            <button onClick={stand} className="btn btn-warning">Stand (Oprește-te)</button>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div>
            <button onClick={() => setGameState('betting')} className="btn btn-primary" style={{ backgroundColor: '#17a2b8', fontSize: '20px' }}>
              Joacă Mâna Următoare
            </button>
            <button onClick={onExit} className="btn btn-warning" style={{ marginLeft: '10px' }}>Schimbă Jucătorii</button>
          </div>
        )}
      </div>

      <div className="table-section">
        {/* ZONA DEALERULUI */}
        <section style={{ marginBottom: '40px' }}>
          <h3>Dealer (Scor: {gameState === 'playing' ? '?' : calculateScore(dealerHand)})</h3>
          <div className="hand-container">
            {dealerHand.map((c, i) => <Card key={i} card={c} hidden={i === 0 && gameState === 'playing'} />)}
          </div>
        </section>
        
        <hr style={{ width: '80%', opacity: 0.2, margin: '20px auto' }} />

        {/* ZONA JUCĂTORILOR */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', width: '100%' }}>
          {playerStates.map((p, index) => {
            const isActive = index === activePlayerIndex && gameState === 'playing';
            return (
              <div key={p.id} style={{ 
                backgroundColor: isActive ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                border: isActive ? '2px solid gold' : '2px solid transparent',
                padding: '15px',
                borderRadius: '15px',
                transition: 'all 0.3s ease',
                opacity: (p.status === 'bust' || p.status === 'stand' || p.status === 'done') && !isActive && gameState === 'playing' ? 0.6 : 1
              }}>
                <h3 style={{ color: p.isMe ? '#28a745' : 'white', marginBottom: '5px' }}>
                  {p.name} {p.isMe && '(Tu)'}
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>
                  Pariu: ${p.bet} | Scor: {calculateScore(p.hand)}
                </p>
                
                {p.result && <div style={{ color: p.result.includes('Câștig') ? '#28a745' : '#dc3545', fontWeight: 'bold', marginBottom: '10px' }}>{p.result}</div>}
                
                <div className="hand-container" style={{ minHeight: '120px' }}>
                  {p.hand.map((c, i) => <Card key={i} card={c} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}