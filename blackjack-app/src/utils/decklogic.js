
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck() {
  let deck = [];
  for (let suit of SUITS) {
    for (let value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck;
}


// O funcție de ajutor pentru a genera un număr random între min și max (inclusiv)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 1. Funcția de "Wash" (Spălare pe masă - de fapt vechiul tău algoritm Fisher-Yates)
function washCards(deck) {
  let shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 2. Tăierea pachetului (Cut) în două jumătăți ușor inegale
function cutDeck(deck) {
  // Jumătate +/- 5 cărți pentru realism (eroare umană)
  const variance = getRandomInt(-5, 5);
  const cutIndex = Math.floor(deck.length / 2) + variance;
  
  // Ne asigurăm că tăietura este validă
  const safeCutIndex = Math.max(0, Math.min(deck.length, cutIndex));

  return {
    leftHalf: deck.slice(0, safeCutIndex),
    rightHalf: deck.slice(safeCutIndex)
  };
}

// 3. Amestecarea "Riffle" imperfectă
function riffleShuffle(leftHalf, rightHalf) {
  let shuffledDeck = [];
  // Folosim copii pentru a nu muta array-urile originale
  let left = [...leftHalf];
  let right = [...rightHalf];

  while (left.length > 0 || right.length > 0) {
    // Luăm din stânga
    if (left.length > 0 && (right.length === 0 || Math.random() < 0.52)) {
      shuffledDeck.push(left.shift()); // .shift() este echivalentul lui .pop(0) din Python
      
      // 10% șansă să cadă două cărți odată (lipite)
      if (left.length > 0 && Math.random() < 0.1) {
        shuffledDeck.push(left.shift());
      }
    }
    // Luăm din dreapta
    if (right.length > 0 && (left.length === 0 || Math.random() >= 0.52)) {
      shuffledDeck.push(right.shift());
      
      if (right.length > 0 && Math.random() < 0.1) {
        shuffledDeck.push(right.shift());
      }
    }
  }
  return shuffledDeck;
}

// 4. Amestecarea "Strip" (Extragerea unor pachețele mici și mutarea lor)
function stripShuffle(deck) {
  let currentDeck = [...deck];
  const stripSize = Math.floor(currentDeck.length / 10); // Aproximativ 5 cărți la un pachet de 52

  for (let i = 0; i < 5; i++) {
    const topCards = currentDeck.slice(0, stripSize);
    const rest = currentDeck.slice(stripSize);
    currentDeck = [...rest, ...topCards];
  }
  return currentDeck;
}

// 5. Mai multe Riffle Shuffles consecutive
function multipleRiffleShuffles(deck, times = 3) {
  let currentDeck = [...deck];
  for (let i = 0; i < times; i++) {
    const { leftHalf, rightHalf } = cutDeck(currentDeck);
    currentDeck = riffleShuffle(leftHalf, rightHalf);
  }
  return currentDeck;
}

export function shuffleDeck(deck) {
  let currentDeck = [...deck];

  // 1. Spălarea cărților pe masă
  currentDeck = washCards(currentDeck);

  // 2. Două amestecări tip Riffle
  currentDeck = multipleRiffleShuffles(currentDeck, 2);

  // 3. O amestecare tip Strip
  currentDeck = stripShuffle(currentDeck);

  // 4. Încă două amestecări tip Riffle
  currentDeck = multipleRiffleShuffles(currentDeck, 2);

  // 5. Tăierea finală (Card Cut) - jumătatea de jos vine peste cea de sus
  const { leftHalf, rightHalf } = cutDeck(currentDeck);
  currentDeck = [...rightHalf, ...leftHalf];

  return currentDeck;
}

export function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      score += 11;
      aces += 1;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  }

  
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
}