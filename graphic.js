const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const GRAVITY_CONSTANT = 10;
const FRICTION_CONSTANT = 0.01;
const RESTITUTION_CONSTANT = 0.9;

function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

class Ball {
  constructor(x, y, vx, vy, color, r, mass) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.r = r;
    this.mass = mass;
    this.collide = false;
  }
  draw() {
    ctx.beginPath();
    if (this.collide) ctx.fillStyle = 'red';
    else ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.font = `bold ${this.r}px Arial`;
    ctx.fillText(this.mass, this.x, this.y + this.r / 2);

    this.collide = false;
  }
  update(ELASPED_TIME) {
    this.vy += GRAVITY_CONSTANT * ELASPED_TIME;

    if (this.x + this.r >= width) {
      this.vx = -this.vx * RESTITUTION_CONSTANT;
      this.x = width - this.r;
    }

    if (this.x - this.r <= 0) {
      this.vx = -this.vx * RESTITUTION_CONSTANT;
      this.x = this.r;
    }

    if (this.y + this.r >= height) {
      this.vy = -this.vy * RESTITUTION_CONSTANT;
      this.y = height - this.r;
    }

    if (this.y - this.r <= 0) {
      this.vy = -this.vy * RESTITUTION_CONSTANT;
      this.y = this.r;
    }

    this.x += this.vx * ELASPED_TIME;
    this.y += this.vy * ELASPED_TIME;
    // this.vx = lerp(this.vx, 0, FRICTION_CONSTANT);
    // this.vy = lerp(this.vy, 0, FRICTION_CONSTANT);
  }
  collisionDetect() {
    for (let i = 0; i < balls.length; i++) {
      if (this !== balls[i]) {
        const dx = this.x - balls[i].x;
        const dy = this.y - balls[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.r + balls[i].r) {
          this.collide = true;
          balls[i].collide = true;
          let vCollision = { x: balls[i].x - this.x, y: balls[i].y - this.y };
          let vCollisionNorm = {
            x: vCollision.x / distance,
            y: vCollision.y / distance,
          };

          let vRelativeVelocity = {
            x: this.vx - balls[i].vx,
            y: this.vy - balls[i].vy,
          };
          let speed =
            vRelativeVelocity.x * vCollisionNorm.x +
            vRelativeVelocity.y * vCollisionNorm.y;
          if (speed <= 0) return;

          speed *= RESTITUTION_CONSTANT;

          let impulse = (2 * speed) / (this.mass + balls[i].mass);
          this.vx -= impulse * balls[i].mass * vCollisionNorm.x;
          this.vy -= impulse * balls[i].mass * vCollisionNorm.y;
          balls[i].vx += impulse * this.mass * vCollisionNorm.x;
          balls[i].vy += impulse * this.mass * vCollisionNorm.y;
        }
      }
    }
  }
}

let balls = [];
let LAST_TIME = new Date();

while (balls.length < 10) {
  let radius = random(25, 100);
  let ball = new Ball(
    random(0 + radius, width - radius),
    random(0 + radius, height - radius),
    0,
    0,
    `hsl(${random(0, 360)}, 50%, 50%)`,
    radius,
    radius * 5
  );

  balls.push(ball);
}

function loop() {
  let CURRENT_TIME = new Date();
  let ELASPED_TIME = (CURRENT_TIME - LAST_TIME) / 100;
  LAST_TIME = CURRENT_TIME;

  ctx.fillStyle = 'hsl(0, 0%, 5%)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < balls.length; i++) {
    balls[i].collisionDetect();
    balls[i].update(ELASPED_TIME);
    balls[i].draw();
  }

  requestAnimationFrame(loop);
}

canvas.addEventListener('click', (e) => {
  let x = e.clientX;
  let y = e.clientY;
  let nearestX = Infinity;
  let nearestY = Infinity;
  let nearest = undefined;

  balls.forEach((ball) => {
    let diffX = Math.abs(x - ball.x);
    let diffY = Math.abs(y - ball.y);
    if (diffX < nearestX && diffY < nearestY) {
      nearestX = diffX;
      nearestY = diffY;
      nearest = ball;
    }
  });

  if (nearest) {
    nearest.vx = random(-10, 10);
    nearest.vy = -1000;
  }
});

loop();
