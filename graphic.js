const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const GRAVITY_CONSTANT = 9.81;
const FRICTION_CONSTANT = 0.01;
const RESTITUTION_CONSTANT = 0.5;

let FRAMERATE = 60;
let DELTA_TIME = 1 / FRAMERATE;

const CollisionFormula = {
  Ball: {
    Ball: Ball_Ball_Collision,
  },
};

function Ball_Ball_Collision(ball_a, ball_b) {
  const dx = ball_a.x - ball_b.x;
  const dy = ball_a.y - ball_b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= ball_a.r + ball_b.r) {
    ball_a.collide = true;
    ball_b.collide = true;

    let collision = {
      x: ball_b.x - ball_a.x,
      y: ball_b.y - ball_a.y,
    };

    // normalize collision vector
    collision = {
      x: collision.x / distance,
      y: collision.y / distance,
    };

    let relative_v = {
      x: ball_a.vx - ball_b.vx,
      y: ball_a.vy - ball_b.vy,
    };

    let speed = relative_v.x * collision.x + relative_v.y * collision.y;
    if (speed <= 0) return;

    speed *= Math.min(ball_a.restitution, ball_b.restitution);

    let impulse = (2 * speed) / (ball_a.mass + ball_b.mass);
    ball_a.vx -= impulse * ball_b.mass * collision.x;
    ball_a.vy -= impulse * ball_b.mass * collision.y;
    ball_b.vx += impulse * ball_a.mass * collision.x;
    ball_b.vy += impulse * ball_a.mass * collision.y;
  }
}

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
  update(DELTA_TIME) {
    this.vy += this.mass * GRAVITY_CONSTANT * DELTA_TIME;

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

    this.x += this.vx * DELTA_TIME;
    this.y += this.vy * DELTA_TIME;
    // this.vx = lerp(this.vx, 0, FRICTION_CONSTANT);
    // this.vy = lerp(this.vy, 0, FRICTION_CONSTANT);
  }
  collisionDetect(GAME_OBJECTS) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
      const that = GAME_OBJECTS[i];
      if (this !== that) {
        CollisionFormula[this.constructor.name][that.constructor.name](
          this,
          that
        );
      }
    }
  }
}

let GAME_OBJECTS = [];

function drawLoop() {
  ctx.fillStyle = 'hsl(0, 0%, 5%)';
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < GAME_OBJECTS.length; i++) {
    GAME_OBJECTS[i].draw();
  }
  requestAnimationFrame(drawLoop);
}

function physicsLoop() {
  for (let i = 0; i < GAME_OBJECTS.length; i++) {
    GAME_OBJECTS[i].collisionDetect(GAME_OBJECTS);
    GAME_OBJECTS[i].update(DELTA_TIME);
  }
  setTimeout(physicsLoop, DELTA_TIME * 1000);
}

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
      radius,
      0.7
    );

    GAME_OBJECTS.push(ball);
  }
  physicsLoop();
  requestAnimationFrame(drawLoop);
}

setup();
