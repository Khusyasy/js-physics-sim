const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const GRAVITY_CONSTANT = 9.81;
const FRICTION_CONSTANT = 0.01;
const RESTITUTION_CONSTANT = 0.5;

let FRAMERATE = 60;
let DELTA_TIME = 1 / FRAMERATE;

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
    this.debug = false;
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
    ctx.lineWidth = this.r / 10;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.vx, this.y + this.vy);
    ctx.stroke();

    this.collide = false;
  }
  debug_draw() {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.rect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
    ctx.stroke();
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
}

let GAME_OBJECTS = [];

function drawLoop() {
  ctx.fillStyle = 'hsl(0, 0%, 5%)';
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < GAME_OBJECTS.length; i++) {
    GAME_OBJECTS[i].draw();
    GAME_OBJECTS[i].update(DELTA_TIME);
  }
  requestAnimationFrame(drawLoop);
}

function collisionDetect(ball_a, ball_b) {
  const dx = ball_a.x - ball_b.x;
  const dy = ball_a.y - ball_b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= ball_a.r + ball_b.r) {
    ball_a.collide = true;
    ball_b.collide = true;
    return [ball_a, ball_b];
  }
  return null;
}

function collisionResponse(ball_a, ball_b) {
  const dx = ball_a.x - ball_b.x;
  const dy = ball_a.y - ball_b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

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
  if (speed <= 0) return false;

  speed *= Math.min(ball_a.restitution, ball_b.restitution);

  let impulse = (2 * speed) / (ball_a.mass + ball_b.mass);
  ball_a.vx -= impulse * ball_b.mass * collision.x;
  ball_a.vy -= impulse * ball_b.mass * collision.y;
  ball_b.vx += impulse * ball_a.mass * collision.x;
  ball_b.vy += impulse * ball_a.mass * collision.y;
  return true;
}

function physicsLoop() {
  const possible_collisions = [];
  const detected_collisions = [];

  let sorted_objects = GAME_OBJECTS.sort((a, b) => a.x - b.x);

  sorted_objects.forEach((object) => {
    let tmp = sorted_objects.filter((other) => {
      return !(Math.abs(other.x - object.x) > other.r + object.r);
    });
    if (tmp.length > 1) possible_collisions.push(tmp);
  });
  let count = 0;
  possible_collisions.forEach((collisions) => {
    for (let i = 0; i < collisions.length; i++) {
      for (let j = 0; j < collisions.length; j++) {
        count++;
        if (i == j) continue;
        const collision = collisionDetect(collisions[i], collisions[j]);
        if (collision) detected_collisions.push(collision);
      }
    }
  });
  console.log(count);

  detected_collisions.forEach(([ball_a, ball_b]) => {
    collisionResponse(ball_a, ball_b);
  });
  setTimeout(physicsLoop, DELTA_TIME * 1000);
}

function setup() {
  while (GAME_OBJECTS.length < 20) {
    let radius = random(20, 30);
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
