// backend/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { createDeck, shuffleDeck, calculateScore } = require('./utils/deck');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST", "PUT"] }
});

const activeRooms = {};


function getRoomBySocket(socketId) {
    for (const roomCode in activeRooms) {
        const room = activeRooms[roomCode];
        const pIndex = room.players.findIndex(p => p.socketId === socketId);
        if (pIndex !== -1) return { roomCode, room, pIndex };
    }
    return null;
}


function broadcastState(roomCode) {
    const room = activeRooms[roomCode];
    if(!room) return;

    room.players.forEach(targetPlayer => {
        const customizedPlayers = room.players.map((p, index) => ({
            id: `p${index + 1}`,
            socketId: p.socketId,
            name: p.name,
            bet: p.bet,
            status: p.status,
            result: p.result,
            hand: p.hand,
            isMe: (p.socketId === targetPlayer.socketId)
        }));

        io.to(targetPlayer.socketId).emit('gameStateUpdate', {
            gameState: room.gameState,
            dealerHand: room.dealerHand,
            playerStates: customizedPlayers,
            activePlayerIndex: room.activePlayerIndex
        });
    });
}


const playDealer = async (roomCode, room) => {
    let dScore = calculateScore(room.dealerHand);
    
    while(dScore < 17) {
        await new Promise(res => setTimeout(res, 1000)); 
        room.dealerHand.push(room.deck.pop());
        dScore = calculateScore(room.dealerHand);
        broadcastState(roomCode);
    }

    room.players.forEach(p => {
        if (p.status === 'bust') {
            p.result = 'Bust! Ai pierdut.';
            io.to(p.socketId).emit('payout', { balance: -p.bet, gamePlayed: true, win: false });
        } else {
            const pScore = calculateScore(p.hand);
            if (dScore > 21) {
                p.result = 'Câștigător! (Dealer Bust)';
                io.to(p.socketId).emit('payout', { balance: p.bet, gamePlayed: true, win: true });
            } else if (pScore > dScore) {
                p.result = 'Câștigător!';
                io.to(p.socketId).emit('payout', { balance: p.bet, gamePlayed: true, win: true });
            } else if (pScore === dScore) {
                p.result = 'Egalitate (Push)';
                io.to(p.socketId).emit('payout', { balance: 0, gamePlayed: true, win: false });
            } else {
                p.result = 'Dealerul a câștigat!';
                io.to(p.socketId).emit('payout', { balance: -p.bet, gamePlayed: true, win: false });
            }
        }
        p.status = 'done';
    });

    room.gameState = 'gameOver';
    broadcastState(roomCode);
};

const advanceTurn = async (roomCode, room) => {
    room.activePlayerIndex++;
    if (room.activePlayerIndex >= room.players.length) {
        room.gameState = 'dealerTurn';
        broadcastState(roomCode);
        await playDealer(roomCode, room);
    } else {
        broadcastState(roomCode);
    }
};

io.on('connection', (socket) => {
    socket.on('createRoom', (userData) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        activeRooms[roomCode] = {
            players: [{ socketId: socket.id, id: socket.id, user: userData, name: userData.username, bet: 10, status: 'waiting', hand: [], result: '' }],
            gameState: 'betting', deck: [], dealerHand: [], activePlayerIndex: 0
        };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', ({ roomCode, userData }) => {
        const room = activeRooms[roomCode];
        if (!room) return socket.emit('roomError', 'Masa nu există!');
        if (room.players.length >= 4) return socket.emit('roomError', 'Masa este plină!');
        if (room.gameState !== 'betting') return socket.emit('roomError', 'Jocul a început deja!');

        room.players.push({ socketId: socket.id, id: socket.id, user: userData, name: userData.username, bet: 10, status: 'waiting', hand: [], result: '' });
        socket.join(roomCode);
        io.to(roomCode).emit('playersUpdated', room.players);
    });

    
    socket.on('updateBet', (betAmount) => {
        const found = getRoomBySocket(socket.id);
        if(!found) return;
        found.room.players[found.pIndex].bet = betAmount;
        broadcastState(found.roomCode);
    });

    socket.on('readyToPlay', () => {
        const found = getRoomBySocket(socket.id);
        if(!found) return;
        const { room, roomCode, pIndex } = found;

        room.players[pIndex].status = 'ready';

        
        const allReady = room.players.every(p => p.status === 'ready');
        if(allReady) {
            room.gameState = 'playing';
            room.deck = shuffleDeck(createDeck());
            room.players.forEach(p => {
                p.hand = [room.deck.pop(), room.deck.pop()];
                p.status = 'playing';
                p.result = '';
            });
            room.dealerHand = [room.deck.pop(), room.deck.pop()];
            room.activePlayerIndex = 0;
        }
        broadcastState(roomCode);
    });

    socket.on('playerAction', (action) => {
        const found = getRoomBySocket(socket.id);
        if(!found) return;
        const { room, roomCode, pIndex } = found;

        
        if (room.gameState !== 'playing' || room.activePlayerIndex !== pIndex) return;

        const player = room.players[pIndex];
        if (action === 'hit') {
            player.hand.push(room.deck.pop());
            if (calculateScore(player.hand) > 21) {
                player.status = 'bust';
                advanceTurn(roomCode, room);
                return;
            }
        } else if (action === 'stand') {
            player.status = 'stand';
            advanceTurn(roomCode, room);
            return;
        }
        broadcastState(roomCode);
    });

    
    socket.on('disconnect', () => {
        const found = getRoomBySocket(socket.id);
        if (found) {
            found.room.players.splice(found.pIndex, 1);
            if (found.room.players.length === 0) delete activeRooms[found.roomCode];
            else {
                io.to(found.roomCode).emit('playersUpdated', found.room.players);
                broadcastState(found.roomCode);
            }
        }
    });
});

require('./db');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serverul și WebSockets rulează pe portul ${PORT}`));