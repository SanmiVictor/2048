const board = document.getElementById("board");
const scoreElement = document.getElementById("score");
const newGameBtn = document.getElementById("newGame");
const moveSound = new Audio("move.mp3");
const mergeSound = new Audio("merge.mp3")
const winSound = new Audio("win.mp3");
const gameOverSound = new Audio("gameover.mp3");

function playSound(sound) {
    const audio = sound.cloneNode();
    audio.volume = 0.7; // Adjust between 0 and 1
    audio.play().catch(() => {});
}
const bestScoreElement = document.getElementById("best-score");
const modal = document.getElementById("gameModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalButton = document.getElementById("modalButton");
const undoBtn = document.getElementById("undo");
const SIZE = 4;
let tiles;
let tileElements = [];
let grid = [];
let previousPositions = [];
let score = 0;
let previousGrid = [];
let previousScore = 0;
let mergedThisMove = [];
let hasShownWin = false;
let gameOver = false;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;
bestScoreElement.textContent = bestScore;

let startX = 0;
let startY = 0;

// =========================
// CREATE EMPTY GRID
// =========================

function createGrid() {
    grid = [];

    for (let row = 0; row < SIZE; row++) {
        grid[row] = [];

        for (let col = 0; col < SIZE; col++) {
            grid[row][col] = 0;
        }
    }
}
function showModal(title, message, buttonText = "Play Again") {

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalButton.textContent = buttonText;

    modal.classList.remove("hidden");
}

// =========================
// DRAW BOARD
// =========================

function createBoard() {

    board.innerHTML = "";

    // create background cells
    for(let row = 0; row < SIZE; row++){
        for(let col = 0; col < SIZE; col++){

            const cell = document.createElement("div");
            cell.className = "cell";

            board.appendChild(cell);

        }
    }

    // create moving tile layer
    const layer = document.createElement("div");
    layer.id = "tile-layer";

    board.appendChild(layer);
}
let index = 0;

function drawBoard() {

    const tileLayer = document.getElementById("tile-layer");
    tileLayer.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            if (grid[row][col] !== 0) {

                const tile = document.createElement("div");

                tile.className = "tile tile-" + grid[row][col];
                tile.textContent = grid[row][col];

                // Find previous position
                const oldPos = previousPositions.find(pos =>
                    pos.value === grid[row][col] &&
                    (pos.row !== row || pos.col !== col)
                );

                if (oldPos) {
                    tile.style.left = `${oldPos.col * 80}px`;
                    tile.style.top = `${oldPos.row * 80}px`;

                    tileLayer.appendChild(tile);

                    requestAnimationFrame(() => {
                        tile.style.left = `${col * 80}px`;
                        tile.style.top = `${row * 80}px`;
                    });

                } else {
                    tile.style.left = `${col * 80}px`;
                    tile.style.top = `${row * 80}px`;
                    tileLayer.appendChild(tile);
                    tile.classList.add("pop");
                }
            }
        }
    }

    previousPositions = [];
}
// =========================
// RANDOM TILE
// =========================

function addRandomTile() {

    let empty = [];

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (grid[row][col] === 0) {

                empty.push({
                    row,
                    col
                });

            }

        }

    }

    if (empty.length === 0) return;

    const random = empty[Math.floor(Math.random() * empty.length)];

    grid[random.row][random.col] =
        Math.random() < 0.9 ? 2 : 4;

}
    function slideAndMerge(arr) {

    // Remove zeros
    arr = arr.filter(n => n !== 0);

   // Merge equal numbers
for (let i = 0; i < arr.length - 1; i++) {

    if (arr[i] === arr[i + 1]) {

        arr[i] *= 2;
score += arr[i];
mergedThisMove.push(arr[i]);
playSound(mergeSound);
arr[i + 1] = 0;

    }

}

    // Remove zeros again
    arr = arr.filter(n => n !== 0);

    // Fill remaining spaces
    while (arr.length < SIZE) {

        arr.push(0);

    }

    scoreElement.textContent = score;
    if (score > bestScore) {

    bestScore = score;

    bestScoreElement.textContent = bestScore;

    localStorage.setItem("bestScore", bestScore);

}

return arr;

}
         function boardsAreEqual(board1, board2) {

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            if (board1[row][col] !== board2[row][col]) {
                return false;
            }

        }
    }

    return true;
}

// 👇 Put it here
function saveState() {
    previousGrid = grid.map(row => [...row]);
    previousScore = score;
}

function saveGame() {
    localStorage.setItem("grid", JSON.stringify(grid));
    localStorage.setItem("score", score);
    localStorage.setItem("bestScore", bestScore);
}
function loadGame() {

    const savedGrid = localStorage.getItem("grid");
    const savedScore = localStorage.getItem("score");

    if (savedGrid) {
        grid = JSON.parse(savedGrid);
        score = Number(savedScore) || 0;

        scoreElement.textContent = score;
        bestScoreElement.textContent = bestScore;

        drawBoard();
        return true;
    }

    return false;
}

function moveLeft() {

    for (let row = 0; row < SIZE; row++) {
        grid[row] = slideAndMerge(grid[row]);
    }

}       function moveRight() {

    for (let row = 0; row < SIZE; row++) {

        let arr = [...grid[row]].reverse();

        arr = slideAndMerge(arr);

        grid[row] = arr.reverse();

    }

}
       
        function moveUp() {
            for (let col = 0; col < SIZE; col++) {

        let arr = [];

        // Get the column
        for (let row = 0; row < SIZE; row++) {
            arr.push(grid[row][col]);
        }

        // Merge it
        arr = slideAndMerge(arr);

        // Put it back
        for (let row = 0; row < SIZE; row++) {
            grid[row][col] = arr[row];
        }

    }
        }
    
        function moveDown() {

    for (let col = 0; col < SIZE; col++) {

        let arr = [];

        // Get the column from top to bottom
        for (let row = 0; row < SIZE; row++) {
            arr.push(grid[row][col]);
        }

        // Reverse it
        arr.reverse();

        // Merge
        arr = slideAndMerge(arr);

        // Reverse it back
        arr.reverse();

        // Put it back into the grid
        for (let row = 0; row < SIZE; row++) {
            grid[row][col] = arr[row];
        }

}

}
        function isGameOver() {

    // Check for empty cells
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (grid[row][col] === 0) {
                return false;
            }
        }
    }

    // Check horizontal merges
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE - 1; col++) {
            if (grid[row][col] === grid[row][col + 1]) {
                return false;
            }
        }
    }

    // Check vertical merges
    for (let col = 0; col < SIZE; col++) {
        for (let row = 0; row < SIZE - 1; row++) {
            if (grid[row][col] === grid[row + 1][col]) {
                return false;
            }
        }
    }

    return true;
}
        modalButton.addEventListener("click", () => {

    modal.classList.add("hidden");

    if (gameOver) {
        gameOver = false;
        newGame();
    }

});
function saveTilePositions(){

    previousPositions = [];

    for(let row = 0; row < SIZE; row++){
        for(let col = 0; col < SIZE; col++){

            if(grid[row][col] !== 0){

                previousPositions.push({
                    value: grid[row][col],
                    row: row,
                    col: col
                });

            }
        }
    }
}

// =========================
// TOUCH EVENTS
// =========================

board.addEventListener("touchstart", e => {

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

});

board.addEventListener("touchend", e => {

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;

    mergedThisMove = [];
    saveState();
    
    saveTilePositions();
    const oldGrid = grid.map(row => [...row]);

    if (Math.abs(dx) > Math.abs(dy)) {

        if (dx < -30) {
            moveLeft();
        } else if (dx > 30) {
            moveRight();
        }

    } else {

        if (dy < -30) {
            moveUp();
        } else if (dy > 30) {
            moveDown();
        }

    }

   if (!boardsAreEqual(oldGrid, grid)) {
    addRandomTile();
    saveGame();
    playSound(moveSound);
}
    drawBoard();

    if (hasWon() && !hasShownWin) {

        hasShownWin = true;
        
        playSound(winSound);
        showModal(
            "🎉 You Win!",
            "You reached 2048! Keep playing to reach 4096 or higher.",
            "Continue"
        );

    } else if (isGameOver()) {

        gameOver = true;

        showModal(
            "💀 Game Over",
            "Try again and beat your best score!"
        );
        playSound(gameOverSound);

    }

});

function newGame() {

    modal.classList.add("hidden");

    score = 0;
    hasShownWin = false;
    gameOver = false;
    previousGrid = [];
    previousScore = 0;

    scoreElement.textContent = score;

    createGrid();
    addRandomTile();
    addRandomTile();

    drawBoard();
    saveGame();
}

function hasWon() {

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (grid[row][col] === 2048) {
                return true;
            }
        }
    }

    return false;
}

newGameBtn.addEventListener("click", newGame);

undoBtn.addEventListener("click", () => {

    if (previousGrid.length === 0) return;

    grid = previousGrid.map(row => [...row]);
    score = previousScore;

    scoreElement.textContent = score;

    drawBoard();
    saveGame();

    // Prevent multiple undos
    previousGrid = [];
    previousScore = 0;

}); // closes undo event


// START GAME
createBoard();

tiles = document.querySelectorAll(".cell");

if (!loadGame()) {
    newGame();
}
