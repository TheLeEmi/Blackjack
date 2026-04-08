// src/components/game/BlackjackGame.jsx
import { useState, useEffect } from 'react';
import { createDeck, shuffleDeck, calculateScore } from '../../utils/deckLogic';
import Card from './Card';

export default function BlackjackGame() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('idle');
  const [message, setMessage] = useState('');

  const startNewGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setPlayerHand([newDeck.pop(), newDeck.pop()]);
    setDealerHand([newDeck.pop(), newDeck.pop()]);
    setDeck(newDeck);
    setGameState('playing');
    setMessage('');
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    const newDeck = [...deck];
    const newHand = [...playerHand, newDeck.pop()];
    setPlayerHand(newHand);
    setDeck(newDeck);
    if (calculateScore(newHand) > 21) {
      setGameState('gameOver');
      setMessage('Bust! Ai depășit 21. Dealerul câștigă.');
    }
  };

  const stand = () => setGameState('dealerTurn');

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
        const pScore = calculateScore(playerHand);
        setGameState('gameOver');
        if (dealerScore > 21) setMessage('Dealer-ul a făcut Bust! Ai câștigat! 🎉');
        else if (dealerScore > pScore) setMessage('Dealer-ul a câștigat. Mai încearcă!');
        else if (dealerScore < pScore) setMessage('Felicitări! Ai bătut Dealer-ul! 🏆');
        else setMessage('Egalitate (Push)!');
      }
    }
  }, [gameState, dealerHand]);

  return (
    <div className="app-container">
      {message && <h2 className="message-box">{message}</h2>}
      
      <div style={{ margin: '20px' }}>
        {gameState === 'idle' || gameState === 'gameOver' ? (
          <button onClick={startNewGame} className="btn btn-primary">Mână Nouă</button>
        ) : (
          <>
            <button onClick={hit} className="btn btn-primary" disabled={gameState !== 'playing'}>Hit</button>
            <button onClick={stand} className="btn btn-warning" disabled={gameState !== 'playing'}>Stand</button>
          </>
        )}
      </div>

      <div className="table-section">
        <section>
          <h3>Dealer (Scor: {gameState === 'playing' ? '?' : calculateScore(dealerHand)})</h3>
          <div className="hand-container">
            {dealerHand.map((c, i) => <Card key={i} card={c} hidden={i === 0 && gameState === 'playing'} />)}
          </div>
        </section>
        
        <section className="player-area">
          <h3>Tu (Scor: {calculateScore(playerHand)})</h3>
          <div className="hand-container">
            {playerHand.map((c, i) => <Card key={i} card={c} />)}
          </div>
        </section>
      </div>
    </div>
  );
}