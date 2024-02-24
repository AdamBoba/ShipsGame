// client/script.js
document.addEventListener('DOMContentLoaded', function () {
  const socket = io();
  let myId;
  let opponents = {};

  const myBoardElement = document.getElementById('myBoard');
  const enemyBoardElement = document.getElementById('enemyBoard');
  const myBoard = initializeGameBoard();
  const enemyBoard = initializeGameBoard();
  let shipsPlaced = 0;
  let ready = false;

  // Rysuj planszę gracza i przeciwnika
  drawBoard(myBoardElement, myBoard);
  drawBoard(enemyBoardElement, enemyBoard);

  // Kliknięcie na planszę gracza - rozmieszczenie statków
  myBoardElement.addEventListener('click', (event) => {
    if (!ready) {
      const cell = event.target;
      const rowIndex = cell.dataset.row;
      const colIndex = cell.dataset.col;

      // Sprawdź, czy statek może być rozmieszczony
      if (canPlaceShip(rowIndex, colIndex, shipsPlaced, myBoard)) {
        placeShip(rowIndex, colIndex, shipsPlaced, myBoard);
        shipsPlaced++;

        // Jeśli wszystkie statki ustawione, pokaż przycisk gotowości
        if (shipsPlaced === 10) {
          showReadyButton();
        }
      }
    }
  });

  // Kliknięcie na planszę przeciwnika - oddawanie strzałów
  enemyBoardElement.addEventListener('click', (event) => {
    if (ready) {
      const cell = event.target;
      const rowIndex = cell.dataset.row;
      const colIndex = cell.dataset.col;

      // Wyslij informacje do serwera o strzale na plansze przeciwnika
      socket.emit('shoot', { row: rowIndex, col: colIndex });
    }
  });

  // Obsługa gotowości gracza
  function toggleReady() {
    if (shipsPlaced === 10 && !ready) {
      ready = true;
      hideReadyButton();
      socket.emit('playerReady', myBoard);
    } else if (ready) {
      ready = false;
      showReadyButton();
      socket.emit('playerNotReady');
    }
  }

  function showReadyButton() {
    const readyButton = document.getElementById('readyButton');
    readyButton.style.display = 'block';
  }

  function hideReadyButton() {
    const readyButton = document.getElementById('readyButton');
    readyButton.style.display = 'none';
  }

  // Funkcje pomocnicze
  function initializeGameBoard() {
    return Array.from({ length: 10 }, () => Array(10).fill(false));
  }

  function drawBoard(boardElement, board) {
    boardElement.innerHTML = '';

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Oznacz miejsce na planszy, gdzie jest statek
        if (board[row][col]) {
          cell.classList.add('ship');
        }

        boardElement.appendChild(cell);
      }
    }
  }

  function canPlaceShip(rowIndex, colIndex, size, board) {
    // Dodaj logikę, która sprawdza, czy można umieścić statek w danym miejscu
    return !board[rowIndex][colIndex];
  }

  function placeShip(rowIndex, colIndex, size, board) {
    // Umieść statek w danym miejscu na planszy
    for (let i = 0; i < size; i++) {
      if (board[rowIndex][colIndex + i] !== undefined) {
        board[rowIndex][colIndex + i] = true;
      } else {
        board[rowIndex + i][colIndex] = true;
      }
    }

    // Zaktualizuj widok planszy
    drawBoard(myBoardElement, myBoard);
  }

  // Pozostała część kodu dla obsługi zdarzeń od serwera, np. playerJoined, playerLeft, updateOpponentBoard, itp.
  socket.on('playerJoined', (playersData) => {
    // Zaktualizuj listę graczy
    updatePlayerList(playersData);
  });

  socket.on('playerLeft', (playersData) => {
    // Zaktualizuj listę graczy
    updatePlayerList(playersData);
  });

  socket.on('updateBoard', (board, playerId) => {
    // Zaktualizuj planszę gracza
    if (playerId === myId) {
      updateMyBoard(board);
    } else {
      updateEnemyBoard(board);
    }
  });

  socket.on('playerReady', (opponentId) => {
    // Obsłuż gotowość przeciwnika (np. zmień kolor ikony gotowości)
    // Możesz dostosować tę funkcję w zależności od potrzeb
  });

  socket.on('shootResult', (result, row, col) => {
    // Obsłuż wynik strzału przeciwnika
    handleShootResult(result, row, col);
  });

  function updatePlayerList(playersData) {
    // Aktualizuj listę graczy na stronie
  }

  function updateMyBoard(board) {
    // Zaktualizuj planszę gracza na stronie
    drawBoard(myBoardElement, board);
  }

  function updateEnemyBoard(board) {
    // Zaktualizuj planszę przeciwnika na stronie
    drawBoard(enemyBoardElement, board);
  }

  function handleShootResult(result, row, col) {
    // Obsłuż wynik strzału przeciwnika
    if (result === 'hit') {
      // Oznacz strzał trafiony na planszy gracza
      const cell = myBoardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      cell.classList.add('hit');
    } else {
      // Oznacz strzał pudło na planszy gracza
      const cell = myBoardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      cell.classList.add('miss');
    }
  }
});
