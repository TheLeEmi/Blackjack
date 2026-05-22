// backend/utils/deck.js

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Am scos 'export' din fața funcțiilor
function createDeck(numDecks = 6) {
  let deck = [];
  
  for (let i = 0; i < numDecks; i++) {
    for (let suit of SUITS) {
      for (let value of VALUES) {
        deck.push({ suit, value, deckId: i + 1 });
      }
    }
  }
  
  return deck;
}

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function washCards(deck) {
  let shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function cutDeck(deck) {
  const variance = getRandomInt(-5, 5);
  const cutIndex = Math.floor(deck.length / 2) + variance;
  const safeCutIndex = Math.max(0, Math.min(deck.length, cutIndex));

  return {
    leftHalf: deck.slice(0, safeCutIndex),
    rightHalf: deck.slice(safeCutIndex)
  };
}

function riffleShuffle(leftHalf, rightHalf) {
  let shuffledDeck = [];
  let left = [...leftHalf];
  let right = [...rightHalf];

  while (left.length > 0 || right.length > 0) {
    if (left.length > 0 && (right.length === 0 || Math.random() < 0.52)) {
      shuffledDeck.push(left.shift()); 
      if (left.length > 0 && Math.random() < 0.1) {
        shuffledDeck.push(left.shift());
      }
    }
    if (right.length > 0 && (left.length === 0 || Math.random() >= 0.52)) {
      shuffledDeck.push(right.shift());
      if (right.length > 0 && Math.random() < 0.1) {
        shuffledDeck.push(right.shift());
      }
    }
  }
  return shuffledDeck;
}

function stripShuffle(deck) {
  let currentDeck = [...deck];
  const stripSize = Math.floor(currentDeck.length / 10); 

  for (let i = 0; i < 5; i++) {
    const topCards = currentDeck.slice(0, stripSize);
    const rest = currentDeck.slice(stripSize);
    currentDeck = [...rest, ...topCards];
  }
  return currentDeck;
}

function multipleRiffleShuffles(deck, times = 3) {
  let currentDeck = [...deck];
  for (let i = 0; i < times; i++) {
    const { leftHalf, rightHalf } = cutDeck(currentDeck);
    currentDeck = riffleShuffle(leftHalf, rightHalf);
  }
  return currentDeck;
}

function shuffleDeck(deck) {
  let currentDeck = [...deck];
  currentDeck = washCards(currentDeck);
  currentDeck = multipleRiffleShuffles(currentDeck, 2);
  currentDeck = stripShuffle(currentDeck);
  currentDeck = multipleRiffleShuffles(currentDeck, 2);
  const { leftHalf, rightHalf } = cutDeck(currentDeck);
  currentDeck = [...rightHalf, ...leftHalf];

  return currentDeck;
}

function calculateScore(hand) {
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

// Exportăm funcțiile în stilul cerut de backend-ul Node.js!
module.exports = { createDeck, shuffleDeck, calculateScore };