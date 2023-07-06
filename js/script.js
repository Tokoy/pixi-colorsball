class Ball {
  constructor(color, size, x, y) {
    this.color = color;
    this.size = size;
    this.x = x;
    this.y = y;
    this.element = document.createElement('div');
    this.element.classList.add('ball');
    this.element.style.backgroundColor = color;
    this.element.style.width = size + 'px';
    this.element.style.height = size + 'px';
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  handleMouseDown(event) {
    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.element.style.zIndex = 1;
  }

  handleMouseUp(event) {
    if (this.dragging) {
      this.dragging = false;
      const overlappingBall = this.checkForOverlap();
      if (overlappingBall) {
        this.mergeWith(overlappingBall);
      } else {
        this.updatePosition();
      }
      this.element.style.zIndex = 0;
    }
  }

  handleMouseMove(event) {
    if (this.dragging) {
      const dx = event.clientX - this.dragStartX;
      const dy = event.clientY - this.dragStartY;
      this.x += dx;
      this.y += dy;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.updatePosition();
    }
  }

  updatePosition() {
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
  }

  checkForOverlap() {
    const balls = document.querySelectorAll('.ball');
    for (let i = 0; i < balls.length; i++) {
      if (balls[i] !== this.element) {
        const rect1 = this.element.getBoundingClientRect();
        const rect2 = balls[i].getBoundingClientRect();
        if (rect1.left < rect2.right && rect1.right > rect2.left && rect1.top < rect2.bottom && rect1.bottom > rect2.top) {
          return balls[i];
        }
      }
    }
    return null;
  }

  mergeWith(ball) {
    const rect1 = this.element.getBoundingClientRect();
    const rect2 = ball.getBoundingClientRect();
    const size = rect1.width + rect2.width;
    const color = this.element.style.backgroundColor;
    const x = Math.min(rect1.left, rect2.left);
    const y = Math.min(rect1.top, rect2.top);
    const mergedBall = new Ball(color, size, x, y);
    this.element.remove();
    ball.remove();
    this.game.addBall(mergedBall);
  }

  setGame(game) {
    this.game = game;
  }
}

class Game {
  constructor(element) {
    this.element = element;
    this.balls = [];
    this.generateBalls();
    this.checkForMergesInterval = setInterval(this.checkForMerges.bind(this), 100);
  }

  generateBalls() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    //const numBalls = Math.floor(Math.random() * 10) * 2 + 1; // generate odd number of balls
    const numBalls = 5;
    const ballSize = 50;
    const margin = 50;
    const maxWidth = this.element.clientWidth - margin * 2 - ballSize;
    const maxHeight = this.element.clientHeight - margin * 2 - ballSize;
    const positions = new Set();
    while (positions.size < numBalls) {
      const x = Math.floor(Math.random() * maxWidth) + margin;
      const y = Math.floor(Math.random() * maxHeight) + margin;
      const position = `${x},${y}`;
      if (!positions.has(position)) {
        positions.add(position);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const ball = new Ball(color, ballSize, x, y);
        ball.setGame(this);
        this.element.appendChild(ball.element);
        this.balls.push(ball);
      }
    }
  }

  addBall(ball) {
    this.balls.push(ball);
    this.element.appendChild(ball.element);
  }

  checkForMerges() {
    const balls = document.querySelectorAll('.ball');
    for (let i = 0; i < balls.length; i++) {
      const ball1 = balls[i];
      for (let j = i + 1; j < balls.length; j++) {
        const ball2 = balls[j];
        const rect1 = ball1.getBoundingClientRect();
        const rect2 = ball2.getBoundingClientRect();
        if (rect1.left < rect2.right && rect1.right > rect2.left && rect1.top < rect2.bottom && rect1.bottom > rect2.top) {
          if (ball1.style.backgroundColor === ball2.style.backgroundColor) {
            const x = Math.min(rect1.left, rect2.left);
            const y = Math.min(rect1.top, rect2.top);
            const size = rect1.width + rect2.width;
            const color = ball1.style.backgroundColor;
            const mergedBall = new Ball(color, size, x, y);
            ball1.remove();
            ball2.remove();
            this.addBall(mergedBall);
            return;
          } else {
            this.gameOver();
            return;
          }
        }
      }
    }
  }

  gameOver() {
    clearInterval(this.checkForMergesInterval);
    alert('Game over!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const game = new Game(gameArea);
});