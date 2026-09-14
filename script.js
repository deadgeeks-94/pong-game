const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Touch tracking
let touchStartY = 0;
let touchCurrentY = 0;
let isTouching = false;

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

// Initialize canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    const width = Math.min(800, window.innerWidth - 40);
    const height = Math.min(400, window.innerHeight - 300);
    
    canvas.width = width;
    canvas.height = height;
    
    // Reinitialize paddles with new canvas dimensions
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    computerPaddle.x = canvas.width - paddleWidth - 10;
    computerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
}

// Player paddle (left side)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Computer paddle (right side)
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 6,
    dx: 5,
    dy: 5,
    speed: 5
};

// Keyboard input
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
});

// Mouse movement for player paddle (Desktop)
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerPaddle.y = mouseY - playerPaddle.height / 2;
});

// Touch controls for mobile/Android
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchStartY = touch.clientY - rect.top;
    isTouching = true;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!isTouching) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchCurrentY = touch.clientY - rect.top;
    playerPaddle.y = touchCurrentY - playerPaddle.height / 2;
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    isTouching = false;
    e.preventDefault();
});

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update functions
function updatePlayerPaddle() {
    // Arrow keys control (Desktop)
    if (keys['ArrowUp'] || keys['w']) {
        playerPaddle.y -= paddleSpeed;
    }
    if (keys['ArrowDown'] || keys['s']) {
        playerPaddle.y += paddleSpeed;
    }
    
    // Boundary checking
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

function updateComputerPaddle() {
    // AI logic - follows the ball
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    
    if (computerCenter < ballCenter - 35) {
        computerPaddle.y += paddleSpeed * 0.8; // Slightly slower for balance
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y -= paddleSpeed * 0.8;
    }
    
    // Boundary checking
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Paddle collision
    if (checkPaddleCollision(playerPaddle) || checkPaddleCollision(computerPaddle)) {
        ball.dx = -ball.dx;
        ball.dx *= 1.02; // Slight speed increase
    }
    
    // Score points
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

function checkPaddleCollision(paddle) {
    if (ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height) {
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.dy = hitPos * ball.speed;
        
        return true;
    }
    return false;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameRunning = !gameRunning;
    document.getElementById('startBtn').textContent = gameRunning ? 'Pause Game' : 'Resume Game';
}

function resetGame() {
    gameRunning = false;
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    document.getElementById('startBtn').textContent = 'Start Game';
    resetBall();
}

// Initialize canvas and start game loop
resizeCanvas();
gameLoop();