// src/pages/CardCounting.jsx
import { useState, useEffect } from 'react';
import { createDeck, shuffleDeck } from '../utils/deckLogic';
import Card from '../components/game/Card';
import './CardCounting.css'; // Importăm noul fișier CSS!

export default function CardCounting() {
  const [phase, setPhase] = useState('intro'); // 'intro', 'loading', 'playing', 'guessing', 'result'
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
    if (userGuess !== '') setPhase('result');
  };

  return (
    <div className="app-container">
      <h1> Antrenament Numărat Cărți (Hi-Lo)</h1>

      {phase === 'intro' && (
        <div className="info-card">
          <h2>Reguli Sistem Hi-Lo</h2>
          <ul className="rules-list">
            <li>Cărțile <strong>2, 3, 4, 5, 6</strong> valorează <strong className="positive-val">+1</strong></li>
            <li>Cărțile <strong>7, 8, 9</strong> valorează <strong>0</strong></li>
            <li>Cărțile <strong>10, J, Q, K, A</strong> valorează <strong className="negative-val">-1</strong></li>
          </ul>
          
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">Câte cărți vrei să numeri?</label>
              <input 
                type="number" 
                value={targetNumCards} 
                onChange={(e) => setTargetNumCards(e.target.value)} 
                min="1" 
                max="52" 
                className="custom-input" 
              />
            </div>

            <div className="setting-item">
              <label className="setting-label">Viteză afișare:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))} 
                className="custom-input speed-select"
              >
                <option value={2000}>Începător (2s)</option>
                <option value={1000}>Normal (1s)</option>
                <option value={500}>Avansat (0.5s)</option>
              </select>
            </div>
          </div>

          <button onClick={startTraining} className="btn btn-info">Începe Antrenamentul</button>
        </div>
      )}

      {phase === 'loading' && (
        <div className="loading-area">
          <h2>Se pregătesc cărțile... ⏳</h2>
          <p>Se preîncarcă imaginile în memorie.</p>
        </div>
      )}

      {phase === 'playing' && (
        <div>
          <h3>Fii atent! Cartea {cardsShown} din {targetNumCards}</h3>
          <div className="card-display-area">
            {currentCard ? <Card card={currentCard} /> : <p>Pregătește-te...</p>}
          </div>
        </div>
      )}

      {phase === 'guessing' && (
        <div className="info-card">
          <h2>Cărțile s-au terminat!</h2>
          <form onSubmit={handleSubmit}>
            <label className="setting-label" style={{ display: 'block', marginBottom: '15px' }}>
              Care este scorul final?
            </label>
            <input 
              type="number" 
              value={userGuess} 
              onChange={(e) => setUserGuess(e.target.value)} 
              className="custom-input" 
              required 
            />
            <br /><br />
            <button type="submit" className="btn btn-primary">Verifică</button>
          </form>
        </div>
      )}

      {phase === 'result' && (
        <div className="info-card">
          {parseInt(userGuess) === actualCount ? (
            <h2 className="positive-val"> Felicitări! Numărătoarea ta este corectă!</h2>
          ) : (
            <h2 className="negative-val">
               Greșit! Numărătoarea corectă era <strong>{actualCount}</strong>. (Tu ai zis {userGuess})
            </h2>
          )}
          <br />
          <button onClick={() => setPhase('intro')} className="btn btn-info">Mai încearcă</button>
        </div>
      )}
    </div>
  );
}