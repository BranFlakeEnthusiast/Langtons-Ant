const canvas = document.getElementById("antCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

const cellsize = 7;
const rows = Math.ceil(canvas.height / cellsize)
const cols = Math.ceil(canvas.width / cellsize)
let grid = Array.from({ length: rows }, () => Array(cols).fill(0));

let antx = Math.floor(cols/2);
let anty = Math.floor(rows/2);
let direction = parseInt(document.getElementById("directionSelect").value);

let translateX = 0
let translateY = 0
let scale = 1
let isDragging = false;
let lastX, lastY;

let running = true
const pause = document.getElementById('pausebtn');
const restart = document.getElementById('restartbtn');

const maxbtn = document.getElementById('maxbtn');
const minbtn = document.getElementById('minbtn');
const header = document.querySelector('.header');
const content = document.querySelector('.content');

let steps = 60;
let lastTime = 0;
let accumulator = 0;
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

let rawmin = 10;
let rawmax = 10000;
let logmin = Math.log(rawmin);
let logmax = Math.log(rawmax);
let sliderScale = (logmax - logmin)/(rawmax - rawmin)

pause.addEventListener('click', () => {
    running = !running
    pause.innerHTML = running === true ? "⏸":"▶";
});

restart.addEventListener('click', () => {
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    antx = Math.floor(cols / 2);
    anty = Math.floor(rows / 2);
    direction = parseInt(document.getElementById("directionSelect").value);    running = true;
    pause.innerHTML = running === true ? "⏸":"▶";

});

maxbtn.addEventListener('click', () => {
    maxbtn.classList.add('hidden');
    header.classList.remove('hidden');
    content.classList.remove('hidden');
});

minbtn.addEventListener('click', () => {
    maxbtn.classList.remove('hidden');
    header.classList.add('hidden');
    content.classList.add('hidden');
});

function stepAnt(){
    const currentColor = grid[anty][antx];

    if (currentColor === 0) {
        direction = (direction + 1) % 4;
        grid[anty][antx] = 1;
    } else {
        direction = (direction + 3) % 4;
        grid[anty][antx] = 0;
    }

    switch (direction) {
    case 0: anty--; break;
    case 1: antx++; break;
    case 2: anty++; break;
    case 3: antx--; break;
    }

    antx = (antx + cols) % cols;
    anty = (anty + rows) % rows;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let y=0; y < rows; y++) {
        for(let x=0; x < cols; x++) {
            ctx.fillStyle = grid[y][x] === 1 ? 'white' : 'black';
            ctx.fillRect(x * cellsize, y * cellsize, cellsize, cellsize);
        }
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(antx * cellsize, anty * cellsize, cellsize, cellsize);
}

speedSlider.addEventListener('input', () => {
    rawSteps = parseInt(speedSlider.value);
    logSteps = logmin + sliderScale*(rawSteps-rawmin);
    steps = 1000/Math.floor(Math.exp(logSteps));
});

function update(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (running) {
    accumulator += delta;

    while (accumulator >= steps) {
      stepAnt();
      accumulator -= steps;
    }

    draw();
  }

  requestAnimationFrame(update);
}

function updateTransform() {
  canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        translateX += dx;
        translateY += dy;
        lastX = e.clientX
        lastY = e.clientY
        updateTransform();
    }
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.001;
    const zoom = 1 - e.deltaY * zoomIntensity;
    scale *= zoom;
    updateTransform();
}, {passive: false});

draw();
requestAnimationFrame(update);
