// src/components/game/BlackjackGame.jsx
import { useState, useEffect } from 'react';
import { createDeck, shuffleDeck, calculateScore } from '../../utils/deckLogic';
import Card from './Card';

export default function BlackjackGame({ user, players, onGameEnd, onExit }) {
  const [gameState, setGameState] = useState('betting'); 
  const [deck, setDeck] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  
  const [playerStates, setPlayerStates] = useState(() => 
    players.map(p => ({ ...p, hand: [], bet: 10, status: 'waiting', result: '' }))
  );
  
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

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

    if (mainUser) onGameEnd(-mainUser.bet); 

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

  const advanceTurn = (currentStates) => {
    const nextIndex = activePlayerIndex + 1;
    setPlayerStates(currentStates);
    
    if (nextIndex >= currentStates.length) {
      setGameState('dealerTurn');
    } else {
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
    
    if (newStates.some(p => p.isMe)) {
      onGameEnd({ balance: mainUserPayout, gamePlayed: true, win: mainUserWon });
    }
  };

  if (gameState === 'betting') {
    return (
      <div className="app-container">
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <button className="btn btn-warning" onClick={onExit} style={{ fontSize: '14px' }}>
            <img src="/icons/arrow-left.png" alt="Back" className="ui-icon" /> Înapoi la Lobby
          </button>
        </div>
        
        <div className="player-spot" style={{ margin: '0 auto', maxWidth: '600px' }}>
          <h2 style={{ color: 'gold', borderBottom: '1px solid rgba(255,215,0,0.3)', paddingBottom: '10px' }}>Plasează Pariurile</h2>
          <div className="players-grid" style={{ marginTop: '20px' }}>
            {playerStates.map((p, index) => (
              <div key={p.id} style={{ backgroundColor: p.isMe ? 'rgba(40,167,69,0.2)' : 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1, minWidth: '150px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{p.name}</h4>
                {p.isMe && <p style={{ fontSize: '12px', color: '#28a745', margin: '0 0 10px 0' }}>Bal: ${user.balance}</p>}
                <input 
                  type="number" 
                  value={p.bet} 
                  onChange={(e) => handleBetChange(index, e.target.value)}
                  style={{ padding: '8px', width: '80%', textAlign: 'center', borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white' }}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={placeBetsAndStart} style={{ marginTop: '25px', width: '100%' }}>
            Împarte Cărțile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div style={{ minHeight: '80px', marginBottom: '20px' }}>
        {gameState === 'playing' && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: '15px 30px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: 'gold', margin: 0, fontSize: '20px' }}>
              ▶ Rândul: <span style={{ color: 'white' }}>{playerStates[activePlayerIndex].name}</span>
            </h3>
            <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.2)' }}></div>
            <button onClick={hit} className="btn btn-primary" style={{ margin: 0 }}>Hit (Trage)</button>
            <button onClick={stand} className="btn btn-warning" style={{ margin: 0 }}>Stand</button>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setGameState('betting')} className="btn btn-primary">
              Mână Nouă
            </button>
            <button onClick={onExit} className="btn btn-info">
              Schimbă Jucătorii
            </button>
          </div>
        )}
      </div>

      <div className="table-section">
        {/* ZONA DEALERULUI */}
        <section className="player-spot" style={{ padding: '15px 40px', background: 'rgba(0,0,0,0.6)' }}>
          <h3 style={{ margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '2px', color: '#ccc' }}>
            Dealer <span style={{ color: 'white', background: '#333', padding: '2px 8px', borderRadius: '10px', fontSize: '14px' }}>{gameState === 'playing' ? '?' : calculateScore(dealerHand)}</span>
          </h3>
          <div className="hand-container">
            {dealerHand.map((c, i) => <Card key={i} index={i} card={c} hidden={i === 0 && gameState === 'playing'} />)}
          </div>
        </section>
        
        {/* ZONA JUCATORILOR */}
        <div className="players-grid">
          {playerStates.map((p, index) => {
            const isActive = index === activePlayerIndex && gameState === 'playing';
            return (
              <div key={p.id} className={`player-spot ${isActive ? 'active-turn' : ''}`} style={{
                opacity: (p.status === 'bust' || p.status === 'stand' || p.status === 'done') && !isActive && gameState === 'playing' ? 0.6 : 1
              }}>
                <h3 style={{ color: p.isMe ? '#2ecc71' : 'white', margin: '0 0 10px 0', fontSize: '20px' }}>
                  {p.name} {p.isMe && '(Tu)'}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '5px', fontSize: '14px' }}>Bet: ${p.bet}</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '5px', fontSize: '14px' }}>Scor: <strong style={{ color: 'gold' }}>{calculateScore(p.hand)}</strong></span>
                </div>
                
                {p.result && (
                  <div style={{ 
                    position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
                    background: p.result.includes('Câștig') ? '#28a745' : p.result.includes('Bust') || p.result.includes('Dealerul') ? '#dc3545' : '#17a2b8',
                    color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 20, whiteSpace: 'nowrap'
                  }}>
                    {p.result}
                  </div>
                )}
                
                <div className="hand-container">
                  {p.hand.map((c, i) => <Card key={i} index={i} card={c} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}