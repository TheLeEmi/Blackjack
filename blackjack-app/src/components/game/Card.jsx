// src/components/game/Card.jsx
export default function Card({ card, hidden, index }) {
  // Oferim fiecarei carți un index mai mare bazat pe pozitia ei în mana
  // astfel incat ultima carte sa fie mereu deasupra
  const cardStyle = { zIndex: index || 1 };

  if (hidden) {
    return (
      <img 
        src="/cards/back.png" 
        alt="Carte ascunsă" 
        className="playing-card deal-animation" 
        style={cardStyle}
      />
    );
  }

  const imagePath = `/cards/${card.suit}-${card.value}.png`;
  return (
    <img 
      src={imagePath} 
      alt={`${card.value} de ${card.suit}`} 
      className="playing-card deal-animation" 
      style={cardStyle}
    />
  );
}