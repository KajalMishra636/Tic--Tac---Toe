const board = document.getElementById("board");
const cells = Array(9).fill(null);
const player = "X", ai = "O";
let currentPlayer = player;
let gameOver = false;
let moveHistory = [];
let timer;
let timeLeft = 10;
let scores = { player: 0, ai: 0, draw: 0 };

function createBoard() {
  board.innerHTML = "";
  cells.forEach((val, idx) => {
    const div = document.createElement("div");
    div.className = "cell";
    div.dataset.index = idx;
    div.textContent = val || "";
    div.onclick = () => makeMove(idx);
    board.appendChild(div);
  });
  startTimer();
}

function makeMove(index) {
  if (cells[index] || gameOver || currentPlayer !== player) return;
  moveHistory.push([...cells]);
  cells[index] = player;
  update();
  if (!gameOver) aiMove();
}

function aiMove() {
  currentPlayer = ai;
  setTimeout(() => {
    let move = getAIMove(document.getElementById("difficulty").value);
    cells[move] = ai;
    update();
    currentPlayer = player;
  }, 500);
}

function getAIMove(level) {
  const empty = cells.map((val, i) => val ? null : i).filter(v => v !== null);
  if (level === "easy") return empty[Math.floor(Math.random() * empty.length)];
  if (level === "medium" && Math.random() < 0.5) return empty[Math.floor(Math.random() * empty.length)];
  return minimax(cells, ai).index;
}

function minimax(newBoard, playerTurn) {
  const availSpots = newBoard.map((v, i) => v ? null : i).filter(v => v !== null);
  if (checkWin(newBoard, player)) return { score: -10 };
  if (checkWin(newBoard, ai)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  let moves = [];
  for (let i of availSpots) {
    let move = { index: i };
    newBoard[i] = playerTurn;
    let result = minimax(newBoard, playerTurn === ai ? player : ai);
    move.score = result.score;
    newBoard[i] = null;
    moves.push(move);
  }

  return playerTurn === ai ? moves.reduce((a, b) => a.score > b.score ? a : b) : moves.reduce((a, b) => a.score < b.score ? a : b);
}

function checkWin(b, p) {
  const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return winPatterns.some(pattern => pattern.every(i => b[i] === p));
}

function update() {
  createBoard();
  if (checkWin(cells, player)) endGame("Player wins!", "player");
  else if (checkWin(cells, ai)) endGame("AI wins!", "ai");
  else if (cells.every(c => c)) endGame("It's a draw!", "draw");
}

function endGame(msg, winner) {
  document.getElementById("status").textContent = msg;
  scores[winner]++;
  document.getElementById("playerWins").textContent = scores.player;
  document.getElementById("aiWins").textContent = scores.ai;
  document.getElementById("draws").textContent = scores.draw;
  gameOver = true;
  clearInterval(timer);
}

function undoMove() {
  if (moveHistory.length > 0) {
    const prev = moveHistory.pop();
    for (let i = 0; i < 9; i++) cells[i] = prev[i];
    gameOver = false;
    update();
  }
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 10;
  document.getElementById("timer").textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (!gameOver && currentPlayer === player) aiMove();
    }
  }, 1000);
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
}

createBoard();
