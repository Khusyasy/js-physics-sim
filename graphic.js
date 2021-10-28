const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const GRAVITY_CONSTANT = 9.81;
const FRICTION_CONSTANT = 0.01;
const RESTITUTION_CONSTANT = 0.5;

class Ball {
  constructor(x, y, vx, vy, color, r, mass, restitution) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.r = r;
    this.mass = mass;
    this.restitution = restitution;
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

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.vx, this.y + this.vy);
    ctx.stroke();

    this.collide = false;
  }
  update(ELASPED_TIME) {
    this.vy += this.mass * GRAVITY_CONSTANT * ELASPED_TIME;

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
  collisionDetect(GAME_OBJECTS) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
      if (this !== GAME_OBJECTS[i]) {
        const dx = this.x - GAME_OBJECTS[i].x;
        const dy = this.y - GAME_OBJECTS[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.r + GAME_OBJECTS[i].r) {
          this.collide = true;
          GAME_OBJECTS[i].collide = true;
          let vCollision = {
            x: GAME_OBJECTS[i].x - this.x,
            y: GAME_OBJECTS[i].y - this.y,
          };
          let vCollisionNorm = {
            x: vCollision.x / distance,
            y: vCollision.y / distance,
          };

          let vRelativeVelocity = {
            x: this.vx - GAME_OBJECTS[i].vx,
            y: this.vy - GAME_OBJECTS[i].vy,
          };
          let speed =
            vRelativeVelocity.x * vCollisionNorm.x +
            vRelativeVelocity.y * vCollisionNorm.y;
          if (speed <= 0) return;

          speed *= Math.min(this.restitution, GAME_OBJECTS[i].restitution);

          let impulse = (2 * speed) / (this.mass + GAME_OBJECTS[i].mass);
          this.vx -= impulse * GAME_OBJECTS[i].mass * vCollisionNorm.x;
          this.vy -= impulse * GAME_OBJECTS[i].mass * vCollisionNorm.y;
          GAME_OBJECTS[i].vx += impulse * this.mass * vCollisionNorm.x;
          GAME_OBJECTS[i].vy += impulse * this.mass * vCollisionNorm.y;
        }
      }
    }
  }
}

function loop() {
  let CURRENT_TIME = new Date();
  let ELASPED_TIME = (CURRENT_TIME - LAST_TIME) / 100;
  LAST_TIME = CURRENT_TIME;

  ctx.fillStyle = 'hsl(0, 0%, 5%)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < GAME_OBJECTS.length; i++) {
    GAME_OBJECTS[i].collisionDetect(GAME_OBJECTS);
    GAME_OBJECTS[i].update(ELASPED_TIME);
    GAME_OBJECTS[i].draw();
  }

  requestAnimationFrame(loop);
}

let GAME_OBJECTS = [];
let LAST_TIME = new Date();

function setup() {
  while (GAME_OBJECTS.length < 10) {
    let radius = random(25, 100);
    let ball = new Ball(
      random(0 + radius, width - radius),
      random(0 + radius, height - radius),
      0,
      0,
      `hsl(${random(0, 360)}, 50%, 50%)`,
      radius,
      radius / 100,
      radius / 100
    );

    GAME_OBJECTS.push(ball);
  }
  requestAnimationFrame(loop);
}

setup();
