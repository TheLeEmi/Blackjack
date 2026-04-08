// src/components/game/Card.jsx
export default function Card({ card, hidden }) {
  if (hidden) {
    return <img src="/cards/back.png" alt="Carte ascunsă" className="playing-card" />;
  }

  const imagePath = `/cards/${card.suit}-${card.value}.png`;
  return <img src={imagePath} alt={`${card.value} de ${card.suit}`} className="playing-card" />;
}