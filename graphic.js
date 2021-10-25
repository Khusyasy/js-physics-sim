const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const GRAVITY_CONSTANT = 10;
const FRICTION_CONSTANT = 0.01;

function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

class Ball {
  constructor(x, y, vx, vy, color, r) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.r = r;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  }
  update() {
    if (this.x + this.r >= width) {
      this.vx = -this.vx;
    }

    if (this.x - this.r <= 0) {
      this.vx = -this.vx;
    }

    if (this.y + this.r >= height) {
      this.vy = -this.vy;
    } else {
      // this.vy = lerp(this.vy, GRAVITY_CONSTANT, 0.5);
    }

    if (this.y - this.r <= 0) {
      this.vy = -this.vy;
    }

    this.x = lerp(this.x, this.x + this.vx, 0.5);
    this.y = lerp(this.y, this.y + this.vy, 0.5);
    this.vx = lerp(this.vx, 0, FRICTION_CONSTANT);
    this.vy = lerp(this.vy, 0, FRICTION_CONSTANT);
  }
  collisionDetect() {
    for (let i = 0; i < balls.length; i++) {
      if (!(this === balls[i])) {
        const dx = this.x - balls[i].x;
        const dy = this.y - balls[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.r + balls[i].r) {
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
          if (speed < 0) return;

          this.vx -= speed * vCollisionNorm.x;
          this.vy -= speed * vCollisionNorm.y;
          balls[i].vx += speed * vCollisionNorm.x;
          balls[i].vy += speed * vCollisionNorm.y;
        }
      }
    }
  }
}

let balls = [];

while (balls.length < 100) {
  let radius = random(10, 20);
  let ball = new Ball(
    random(0 + radius, width - radius),
    random(0 + radius, height - radius),
    random(-7, 7),
    random(-7, 7),
    `hsl(${random(0, 360)}, 70%, 60%)`,
    radius
  );

  balls.push(ball);
}

function loop() {
  ctx.fillStyle = 'hsl(0, 0%, 5%)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < balls.length; i++) {
    balls[i].collisionDetect();
    balls[i].update();
    balls[i].draw();
  }

  requestAnimationFrame(loop);
}

loop();
