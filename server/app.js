// server/app.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;

app.use(express.static('../client'));

let players = {};
let gameBoard = initializeGameBoard();

io.on('connection', (socket) => {
  console.log('Nowe połączenie:', socket.id);

  // Dodaj gracza do gry
  players[socket.id] = {
    id: socket.id,
    board: initializeGameBoard(),
    opponentBoard: Array.from({ length: 10 }, () => Array(10).fill(false)),
  };

  // Informuj innych graczy o nowym uczestniku
  io.emit('playerJoined', Object.values(players));

  // Obsługa zdarzeń gry
  socket.on('makeMove', (move, opponentId) => {
    // Sprawdź trafienie i zaktualizuj plansze
    const isHit = checkHit(move, players[opponentId].board);
    players[socket.id].opponentBoard[move.row][move.col] = isHit;

    // Wyslij zaktualizowane plansze do obu graczy
    io.to(socket.id).emit('updateBoard', players[socket.id].board);
    io.to(opponentId).emit('updateOpponentBoard', players[socket.id].opponentBoard);
  });

  socket.on('disconnect', () => {
    console.log('Rozłączono:', socket.id);
    // Usuń gracza z gry
    delete players[socket.id];
    io.emit('playerLeft', Object.values(players));
  });
});

server.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na porcie ${PORT}`);
});

function initializeGameBoard() {
  return Array.from({ length: 10 }, () => Array(10).fill(false));
}

function checkHit(move, opponentBoard) {
  return opponentBoard[move.row][move.col];
}
