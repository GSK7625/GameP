const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const scoreboard = {
  player: document.getElementById('playerScore'),
  computer: document.getElementById('computerScore')
};

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 16;
const PADDLE_SPEED = 6;
const COMPUTER_SPEED = 4;
const BALL_SPEED = 5;

let playerScore = 0, computerScore = 0;

// Paddle
const player = {
  x: 10,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const computer = {
  x: canvas.width - PADDLE_WIDTH - 10,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

// Ball
const ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  dy: BALL_SPEED * (Math.random() * 2 - 1)
};

// Drawing functions
function drawRect(x, y, w, h, color = '#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color = '#0ff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Game logic
function resetBall() {
  ball.x = canvas.width / 2 - BALL_SIZE / 2;
  ball.y = canvas.height / 2 - BALL_SIZE / 2;
  ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = BALL_SPEED * (Math.random() * 2 - 1);
}

function updateScore() {
  scoreboard.player.textContent = playerScore;
  scoreboard.computer.textContent = computerScore;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(val, max));
}

function gameLoop() {
  // Move player
  player.y += player.dy;
  player.y = clamp(player.y, 0, canvas.height - player.height);

  // Computer AI: follow the ball with a bit of easing
  const target = ball.y + ball.size / 2 - computer.height / 2;
  if (computer.y + computer.height / 2 < target - 4) {
    computer.y += COMPUTER_SPEED;
  } else if (computer.y + computer.height / 2 > target + 4) {
    computer.y -= COMPUTER_SPEED;
  }
  computer.y = clamp(computer.y, 0, canvas.height - computer.height);

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Collision with top/bottom walls
  if (ball.y < 0) {
    ball.y = 0;
    ball.dy *= -1;
  }
  if (ball.y + ball.size > canvas.height) {
    ball.y = canvas.height - ball.size;
    ball.dy *= -1;
  }

  // Collision with paddles
  if (
    ball.x < player.x + player.width &&
    ball.x > player.x &&
    ball.y + ball.size > player.y &&
    ball.y < player.y + player.height
  ) {
    ball.x = player.x + player.width;
    ball.dx *= -1.07; // bounce and speed up
    // Add some spin based on where the ball hits the paddle
    const hitPos = (ball.y + ball.size / 2) - (player.y + player.height / 2);
    ball.dy += hitPos * 0.15;
  }

  if (
    ball.x + ball.size > computer.x &&
    ball.x + ball.size < computer.x + computer.width &&
    ball.y + ball.size > computer.y &&
    ball.y < computer.y + computer.height
  ) {
    ball.x = computer.x - ball.size;
    ball.dx *= -1.07;
    const hitPos = (ball.y + ball.size / 2) - (computer.y + computer.height / 2);
    ball.dy += hitPos * 0.15;
  }

  // Scoring
  if (ball.x < 0) {
    computerScore++;
    updateScore();
    resetBall();
  }
  if (ball.x + ball.size > canvas.width) {
    playerScore++;
    updateScore();
    resetBall();
  }

  // Draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Net
  for (let i = 10; i < canvas.height; i += 30) {
    drawRect(canvas.width / 2 - 2, i, 4, 18, '#555');
  }
  drawRect(player.x, player.y, player.width, player.height, '#fff');
  drawRect(computer.x, computer.y, computer.width, computer.height, '#fff');
  drawBall(ball.x, ball.y, ball.size, '#0ff');

  requestAnimationFrame(gameLoop);
}

// Controls: Arrow keys
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') {
    player.dy = -PADDLE_SPEED;
  } else if (e.key === 'ArrowDown') {
    player.dy = PADDLE_SPEED;
  }
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    player.dy = 0;
  }
});

// Controls: Mouse (move paddle)
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  player.y = clamp(y - player.height / 2, 0, canvas.height - player.height);
});

// Start game
updateScore();
gameLoop();