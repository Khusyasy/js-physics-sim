function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}
