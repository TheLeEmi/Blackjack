// src/pages/CardCounting.jsx
import { useState, useEffect } from 'react';
import { createDeck, shuffleDeck } from '../utils/deckLogic';
import Card from '../components/game/Card';

export default function CardCounting({ onTrainingEnd }) {
  const [phase, setPhase] = useState('intro'); 
  const [targetNumCards, setTargetNumCards] = useState(10);
  const [speed, setSpeed] = useState(1000);
  
  const [deck, setDeck] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [actualCount, setActualCount] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [cardsShown, setCardsShown] = useState(0);

  const getCardValue = (val) => {
    if (['2', '3', '4', '5', '6'].includes(val)) return 1;
    if (['10', 'J', 'Q', 'K', 'A'].includes(val)) return -1;
    return 0;
  };

  const preloadImages = async (cards) => {
    const promises = cards.map((card) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = `/cards/${card.suit}-${card.value}.png`;
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await Promise.all(promises);
  };

  const startTraining = async () => {
    const validNumCards = Math.min(Math.max(targetNumCards, 1), 52);
    setTargetNumCards(validNumCards);
    
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setActualCount(0);
    setCardsShown(0);
    setCurrentCard(null);
    setUserGuess('');
    
    setPhase('loading'); 
    await preloadImages(newDeck.slice(-validNumCards)); 
    setPhase('playing');
  };

  useEffect(() => {
    if (phase === 'playing') {
      if (cardsShown < targetNumCards && deck.length > 0) {
        const timer = setTimeout(() => {
          const nextDeck = [...deck];
          const card = nextDeck.pop();
          
          setCurrentCard(card);
          setActualCount(prev => prev + getCardValue(card.value));
          setDeck(nextDeck);
          setCardsShown(prev => prev + 1);
        }, speed);
        
        return () => clearTimeout(timer);
      } 
      else if (cardsShown >= targetNumCards || deck.length === 0) {
        const timer = setTimeout(() => {
          setCurrentCard(null);
          setPhase('guessing');
        }, speed);
        
        return () => clearTimeout(timer);
      }
    }
  }, [phase, cardsShown, deck, targetNumCards, speed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userGuess !== '') {
      setPhase('result');
      const isCorrect = parseInt(userGuess) === actualCount;
      if (onTrainingEnd) {
        onTrainingEnd({ countAttempted: true, countCorrect: isCorrect });
      }
    }
  };

  
  const inputStyle = { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: 'white', width: '100%', boxSizing: 'border-box', marginTop: '5px' };

  return (
    <div className="app-container">
      <h1 style={{ color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.5)', marginBottom: '30px' }}>
        <img src="/icons/brain.png" alt="Brain" className="ui-icon" /> Masterclass: Numărat Cărți
      </h1>

      {phase === 'intro' && (
        <div className="player-spot" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ color: 'gold', borderBottom: '1px solid rgba(255,215,0,0.3)', paddingBottom: '10px' }}>Sistemul Hi-Lo</h2>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8' }}>
              <li>Cărțile <strong>2, 3, 4, 5, 6</strong> <span style={{margin: '0 10px'}}>+1</span></li>
              <li>Cărțile <strong>7, 8, 9</strong> <span style={{margin: '0 10px'}}>0</span></li>
              <li>Cărțile <strong>10, J, Q, K, A</strong> <span style={{margin: '0 10px'}}>-1</span></li>
            </ul>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#aaa', fontSize: '14px' }}>Număr de cărți (1-52):</label>
            <input type="number" value={targetNumCards} onChange={(e) => setTargetNumCards(e.target.value)} min="1" max="52" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ color: '#aaa', fontSize: '14px' }}>Viteză afișare:</label>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={inputStyle}>
              <option value={2000}>Începător (2s)</option>
              <option value={1000}>Normal (1s)</option>
              <option value={500}>Avansat (0.5s)</option>
            </select>
          </div>

          <button onClick={startTraining} className="btn btn-primary" style={{ width: '100%', fontSize: '18px' }}>Începe Antrenamentul</button>
        </div>
      )}

      {phase === 'loading' && (
        <div className="player-spot" style={{ maxWidth: '400px', margin: '50px auto' }}>
          <h2 style={{ color: 'gold' }}><img src="/icons/hourglass.png" alt="Loading" className="ui-icon" /> Se amestecă pachetul...</h2>
        </div>
      )}

      {phase === 'playing' && (
        <div style={{ marginTop: '50px' }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', padding: '10px 30px', borderRadius: '30px', display: 'inline-block', marginBottom: '30px' }}>
            <h3 style={{ margin: 0, color: 'gold' }}>Cartea {cardsShown} / {targetNumCards}</h3>
          </div>
          <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {currentCard ? <Card card={currentCard} index={cardsShown} /> : <div className="playing-card" style={{ visibility: 'hidden' }}></div>}
          </div>
        </div>
      )}

      {phase === 'guessing' && (
        <div className="player-spot" style={{ maxWidth: '400px', margin: '50px auto' }}>
          <h2 style={{ color: 'gold' }}><img src="/icons/hand-stop.png" alt="Stop" className="ui-icon" /> Stop!</h2>
          <form onSubmit={handleSubmit}>
            <label style={{ color: '#aaa', display: 'block', marginBottom: '10px' }}>Care este scorul (True Count) final?</label>
            <input type="number" value={userGuess} onChange={(e) => setUserGuess(e.target.value)} required style={{...inputStyle, textAlign: 'center', fontSize: '24px'}} />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>Verifică Răspunsul</button>
          </form>
        </div>
      )}

      {phase === 'result' && (
        <div className="player-spot" style={{ maxWidth: '400px', margin: '50px auto' }}>
          {parseInt(userGuess) === actualCount ? (
            <div>
              <h1 style={{ color: '#2ecc71', margin: '0 0 10px 0', fontSize: '50px' }}>✓</h1>
              <h2 style={{ color: '#2ecc71' }}>Corect!</h2>
              <p style={{ color: '#aaa' }}>Ai ochi de vultur.</p>
            </div>
          ) : (
            <div>
              <h1 style={{ color: '#e74c3c', margin: '0 0 10px 0', fontSize: '50px' }}>✗</h1>
              <h2 style={{ color: '#e74c3c' }}>Greșit!</h2>
              <p style={{ fontSize: '18px' }}>Răspunsul tău: <strong style={{ color: '#e74c3c' }}>{userGuess}</strong></p>
              <p style={{ fontSize: '18px' }}>Răspunsul real: <strong style={{ color: '#2ecc71' }}>{actualCount}</strong></p>
            </div>
          )}
          <button onClick={() => setPhase('intro')} className="btn btn-info" style={{ width: '100%', marginTop: '20px' }}>Antrenează-te din nou</button>
        </div>
      )}
    </div>
  );
}